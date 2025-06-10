require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const textToSpeech = require('@google-cloud/text-to-speech');
const AWS = require('aws-sdk');
const app = express();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// สร้าง Text-to-Speech client
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: './google-credentials.json' // ไฟล์ credentials จาก Google Cloud
});

app.use(cors());
app.use(express.json());

app.post('/api/amity/chat', async (req, res) => {
  try {
    // เรียก Amity API
    const amityResponse = await axios({
      method: 'POST',
      url: process.env.AMITY_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AMITY_API_KEY}`
      },
      data: req.body
    });

    // Log เพื่อดูโครงสร้างข้อมูล
    console.log('Amity Response:', JSON.stringify(amityResponse.data, null, 2));

    // ตรวจสอบและเข้าถึงข้อมูลอย่างปลอดภัย
    let aiResponse;
    if (amityResponse.data && typeof amityResponse.data === 'string') {
      // กรณีที่ response เป็น string
      aiResponse = JSON.parse(amityResponse.data);
    } else if (amityResponse.data?.answer) {
      // กรณีที่ response มี answer โดยตรง
      aiResponse = JSON.parse(amityResponse.data.answer);
    } else if (amityResponse.data?.data?.answer) {
      // กรณีที่ response มี data.answer
      aiResponse = JSON.parse(amityResponse.data.data.answer);
    } else {
      throw new Error('Invalid response format from Amity API');
    }

    // แปลงข้อความเป็นเสียง
    const ttsRequest = {
      input: { text: aiResponse.message },
      voice: { 
        languageCode: 'th-TH',
        name: 'th-TH-Standard-A'
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    // ส่งกลับทั้งเสียงและ JSON (ไม่รวม message)
    res.json({
      audio: ttsResponse.audioContent.toString('base64'),
      tools: aiResponse.tools,
      metadata: aiResponse.metadata
    });

  } catch (error) {
    console.error('Error:', error);
    console.error('Full Response:', JSON.stringify(error.response?.data || {}, null, 2));
    res.status(500).json({ 
      error: 'Server error',
      details: error.message,
      response: error.response?.data
    });
  }
});

app.post('/api/notification/transfer-success', async (req, res) => {
  try {
    const { recipient, amount } = req.body;
    
    const ttsRequest = {
      input: { 
        text: `โอนเงินให้คุณ${recipient} จำนวน ${amount} บาท เรียบร้อยแล้วค่ะ` 
      },
      voice: { 
        languageCode: 'th-TH',
        name: 'th-TH-Standard-A'
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    res.json({
      audio: ttsResponse.audioContent.toString('base64')
    });

  } catch (error) {
    console.error('Error generating notification sound:', error);
    res.status(500).json({ 
      error: 'Failed to generate notification sound' 
    });
  }
});

app.post('/api/statement/send-email', async (req, res) => {
  try {
    const { email, type, period } = req.body;

    // สร้าง HTML template สำหรับ statement
    const htmlTemplate = `
      <html>
        <body>
          <h2>LH Bank Statement</h2>
          <p>เรียน ท่านลูกค้า</p>
          <p>ตามที่ท่านได้ขอ Statement ${type === 'monthly' ? 'รายเดือน' : 'ทั้งหมด'}
          ${period ? `ย้อนหลัง ${period} เดือน` : ''}</p>
          <p>รายละเอียดตามเอกสารแนบ</p>
          <br/>
          <p>ขอแสดงความนับถือ</p>
          <p>ธนาคารแลนด์แอนด์เฮ้าส์</p>
        </body>
      </html>
    `;

    // ตั้งค่าพารามิเตอร์สำหรับส่งอีเมล
    const params = {
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlTemplate
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: "LH Bank - Statement Request"
        }
      },
      Source: "thanakorn@amity.co" // ต้องเป็นอีเมลที่ verify แล้วใน SES
    };

    // ส่งอีเมล
    await ses.sendEmail(params).promise();

    // ส่งเสียงแจ้งเตือน
    const ttsRequest = {
      input: { 
        text: `ระบบได้จัดส่ง Statement ไปยังอีเมล ${email} เรียบร้อยแล้วค่ะ` 
      },
      voice: { 
        languageCode: 'th-TH',
        name: 'th-TH-Standard-A'
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    res.json({
      success: true,
      message: 'Statement sent successfully',
      audio: ttsResponse.audioContent.toString('base64')
    });

  } catch (error) {
    console.error('Error sending statement:', error);
    res.status(500).json({ 
      error: 'Failed to send statement',
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 