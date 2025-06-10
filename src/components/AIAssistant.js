import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, Fade, Paper, Tooltip, Chip, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrophone, 
  faMicrophoneSlash,
  faArrowLeft,
  faRobot,
  faWandMagicSparkles,
  faKeyboard,
  faVolumeLow,
  faVolumeHigh
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import PinScreen from './PinScreen';
import SuccessDialog from './SuccessDialog';
import StatementSuccessDialog from './StatementSuccessDialog';
import { v4 as uuidv4 } from 'uuid';
import FreezeDialog from './FreezeDialog';
import LinkDialog from './LinkDialog';

const colors = {
  lime: '#d6dc29',
  turquoise: '#49bfc7',
  purple: '#903f98',
  coral: '#f58468',
  blue: '#0086c3',
  yellow: '#fbc410',
  gray: '#9b9f94',
  orange: '#f7941e'
};

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

function AIAssistant() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [greeting, setGreeting] = useState('สวัสดีค่ะ 😊');
  const [subGreeting, setSubGreeting] = useState('AI Assistant ยินดีให้บริการค่ะ');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [suggestions] = useState([
    'เช็คยอด', 'โอนเงิน', 'จ่ายบิล', 'เติมเงิน'
  ]);
  const [waveAmplitude, setWaveAmplitude] = useState(1);
  const amplitudeRef = useRef(1);
  const fadeTimeoutRef = useRef(null);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [transferAmount, setTransferAmount] = useState(0);
  const [commandHistory, setCommandHistory] = useState([]);
  const [transactionType, setTransactionType] = useState(null);
  const [showStatementSuccess, setShowStatementSuccess] = useState(false);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [lastTranscript, setLastTranscript] = useState('');
  const audioRef = useRef(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const abortControllerRef = useRef(null);
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [freezeData, setFreezeData] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkData, setLinkData] = useState(null);
  const [userMessage, setUserMessage] = useState('');

  // เพิ่ม theme object
  const theme = {
    colors: {
      lime: '#d6dc29',
      turquoise: '#49bfc7',
      purple: '#903f98',
      coral: '#f58468',
      blue: '#0086c3',
      yellow: '#fbc410',
      gray: '#9b9f94',
      orange: '#f7941e'
    }
  };

  // สร้าง Audio Context และ Analyser
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    return () => {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // สร้าง session ID ทันทีที่ component mount
  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    console.log('Created new session ID:', newSessionId); // debug log
  }, []);

  // ปังก์ชันกลางสำหรับเรียก API
  const callAPI = async (message, retryCount = 0) => {
    try {
      if (isRequesting) {
        abortControllerRef.current?.abort();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
      }

      setIsRequesting(true);
      setIsProcessing(true);

      abortControllerRef.current = new AbortController();
      const response = await fetch('http://localhost:3001/api/amity/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: message,
          userId: 'User001'
        }),
        signal: abortControllerRef.current.signal
      });

      // Retry logic
      if (!response.ok && retryCount < MAX_RETRIES) {
        console.log(`Attempt ${retryCount + 1} failed, retrying...`);
        await sleep(RETRY_DELAY);
        return callAPI(message, retryCount + 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!abortControllerRef.current.signal.aborted) {
        // Handle audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }

        if (data.audio) {
          audioRef.current = new Audio(`data:audio/mp3;base64,${data.audio}`);
          await audioRef.current.play();
        }

        // Handle message
        if (data.message) {
          setGreeting(data.message);
          setSubGreeting('');
        }

        // Handle links
        if (data.metadata?.links?.length > 0) {
          setLinkData(data.metadata.links);
          setShowLinkDialog(true);
        }

        // Handle tools
        if (data.tools === 'Transfer' && data.metadata) {
          handleTransfer(data.metadata);
        } else if (data.tools === 'Statement' && data.metadata) {
          handleStatement(data.metadata);
        } else if (data.tools === 'Freeze' && data.metadata) {
          handleFreeze(data.metadata);
        }
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        setGreeting('ขออภัยค่ะ มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง');
        setSubGreeting('');
      }
    } finally {
      setIsProcessing(false);
      setIsRequesting(false);
      setTranscript('');
    }
  };

  // ปรับ callAmityAPI ให้ใช้ callAPI
  const callAmityAPI = async (message) => {
    await callAPI(message);
  };

  // ปรับ handleCommand ให้ใช้ callAPI
  const handleCommand = async (command) => {
    setUserMessage(command);
    await callAPI(command);
  };

  // ฟังก์ชันจัดการคารโอนเงิน
  const handleTransfer = (metadata) => {
    const { recipient, amount } = metadata;
    setSelectedRecipient(recipient);
    setTransferAmount(amount);
    setTransactionType('transfer');
    setShowPinScreen(true);
  };

  // ฟังก์ชันจัดการการขอ Statement
  const handleStatement = (metadata) => {
    setTransactionType('statement');
    setShowPinScreen(true);
  };

  // ปังก์ชันจัดการการอายัดบัญชี
  const handleFreeze = (metadata) => {
    const { type, reason, documents, instructions } = metadata;
    
    // เตรียมข้อมูลสำับ FreezeDialog
    const freezeData = {
      type: type || 'credit',
      reason: reason || 'lost',
      documents: documents || ['id_card', 'police_report'],
      instructions: instructions || [
        'นำบัตรประชาชนและใบแจ้งความไปที่สาขา',
        'กรอกแบบฟอร์มขออายัดบัตร',
        'รอรับบัตรใหม่ภายใน 7 วันทำการ'
      ]
    };

    setFreezeData(freezeData);
    setShowFreezeDialog(true);
  };

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // ปรับ speech recognition ให้รอ sessionId
  useEffect(() => {
    if (!sessionId) return; // ไม่ทำงานถ้ายังม่มี sessionId

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'th-TH';
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setTranscript(transcript);
          setUserMessage(transcript);
          
          if (event.results[event.results.length - 1].isFinal) {
            handleCommand(transcript);
          }
        };

        recognitionRef.current.onend = () => {
          // ถ้ายังอยู่ในสถานะ listening ให้เริ่มฟังใหม่
          if (isListening) {
            recognitionRef.current?.start();
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          // ไม่ต้อง reset state ทังหมดเมื่อเกิด error
          if (event.error !== 'no-speech') {
            setIsListening(false);
            setSubGreeting('ไม่สามารถรับังเสียงได้ กรุณาลองใหม่');
          }
        };
      }
    }
  }, [sessionId]); // เพิ่ sessionId เป็น dependency

  const handlePinSuccess = async () => {
    setShowPinScreen(false);

    if (transactionType === 'transfer') {
      setShowSuccess(true);
      setTranscript('');
      
      // เล่นเสียงแจ้งเตือนการโอนเงินสำเร็จจาก endpoint ใหม่
      try {
        const response = await fetch('http://localhost:3001/api/notification/transfer-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: selectedRecipient,
            amount: transferAmount
          })
        });

        const data = await response.json();
        
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }

        audioRef.current = new Audio(`data:audio/mp3;base64,${data.audio}`);
        await audioRef.current.play();
        
        audioRef.current.addEventListener('ended', () => {
          audioRef.current = null;
          // รอให้เสียงเล่นจบแล้วค่อยเคลียร์ state
          setTimeout(() => {
            setShowSuccess(false);
            setSelectedRecipient(null);
            setTransferAmount(0);
            setTransactionType(null);
          }, 3000);
        });

      } catch (error) {
        console.error('Error playing success sound:', error);
        // ถ้าเล่นเสียงไม่สำเร็จ ก็ให้เคลียร state ตามปกติ
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedRecipient(null);
          setTransferAmount(0);
          setTransactionType(null);
        }, 3000);
      }
    } 
    else if (transactionType === 'statement') {
      try {
        const response = await fetch('http://localhost:3001/api/statement/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'thanakorn@amity.co', // ควรเอามาจาก user profile
            type: 'monthly', // หรือจาก metadata ที่ได้จาก Amity
            period: '6' // หรือจาก metadata ที่ได้จาก Amity
          })
        });

        const data = await response.json();
        
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }

        // เล่นเสียงแจ้งเตือนการส่ง statement สำเร็จ
        audioRef.current = new Audio(`data:audio/mp3;base64,${data.audio}`);
        await audioRef.current.play();

        setShowStatementSuccess(true);
        setTranscript('');
        
        audioRef.current.addEventListener('ended', () => {
          audioRef.current = null;
          setTimeout(() => {
            setShowStatementSuccess(false);
            setTransactionType(null);
          }, 3000);
        });

      } catch (error) {
        console.error('Error:', error);
        // แสดง error message ให้ user
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Clear ข้อมูลที่เกี่ยวกับการโอนเงน
    setSelectedRecipient(null);
    setTransferAmount(0);
    setTranscript('');
  };

  const handlePinClose = () => {
    setShowPinScreen(false);
  };

  // ฟรับการวิเคราะห์เสียงให้ไวขึ้น
  const startAudioAnalysis = async (stream) => {
    try {
      mediaStreamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const analyser = analyserRef.current;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.4; // ลดลงเพื่อให้ตอบสนองไวขึ้น
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!isListening) return;
        
        analyser.getByteFrequencyData(dataArray);
        // คำนวณค่าเฉลี่ยแบบให้น้ำหนักกับความถี่กลาง-สูงมากขึ้น
        const weightedSum = dataArray.reduce((acc, val, i) => {
          const weight = Math.min(i / dataArray.length * 2, 1);
          return acc + val * weight;
        }, 0);
        const average = weightedSum / dataArray.length * 2;
        setAudioLevel(average);
        
        requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (error) {
      console.error('Error starting audio analysis:', error);
    }
  };

  // แก้ไขฟังก์ชัน startListening
  const startListening = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'th-TH';

      recognitionRef.current.onresult = (event) => {
        if (isProcessing || isRequesting) return;

        // Clear transcript เก่าเมื่อเริ่มพูดใหม่
        const newTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setTranscript(newTranscript);
        
        if (event.results[event.results.length - 1].isFinal) {
          callAmityAPI(newTranscript);
        }
      };
    }

    // Clear transcript เมื่อเริ่มฟังใหม่
    setTranscript('');
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  // ปรับปรับฟังก์ชัน toggleListening
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setUserMessage('');
      setIsListening(true);
      startListening();
    }
  };

  // ปรับ useEffect ให้ไม่ต้องจัดการ speech recognition
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      console.log('Created new session ID:', newSessionId);
    }
  }, []);

  // Wave Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationFrameId;
    let phase = 0;

    const drawWave = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.fillRect(0, 0, width, height);

      // เพิ่มจำนวน wave และความหลากหลาย
      const waves = [
        { 
          color: colors.purple,
          baseAmplitude: 80,  // เพิ่มขนาดพื้นฐาน
          frequency: 0.03,
          speed: 0.08,
          opacity: 0.4
        },
        { 
          color: colors.blue,
          baseAmplitude: 70,
          frequency: 0.035,
          speed: 0.07,
          opacity: 0.35
        },
        { 
          color: colors.turquoise,
          baseAmplitude: 90,
          frequency: 0.025,
          speed: 0.09,
          opacity: 0.3
        },
        { 
          color: colors.coral,
          baseAmplitude: 60,
          frequency: 0.04,
          speed: 0.06,
          opacity: 0.25
        },
        { 
          color: colors.lime,
          baseAmplitude: 100,
          frequency: 0.02,
          speed: 0.1,
          opacity: 0.2
        }
      ];

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        // เพิ่มความไวและแรงในการตอบสนอง
        const sensitivity = 8.0; // เพิ่มขึ้นมาก
        const baseMovement = 0.6; // การเคลื่อนไหวพื้นฐานแม้ไม่มีเสียง
        
        // คำนวณ amplitude ที่มีการตอบสนองมากขึ้น
        const audioMultiplier = isListening ? 
          baseMovement + ((audioLevel / 50) * sensitivity * waveAmplitude) : 
          baseMovement + (Math.sin(phase * 0.3) * 0.2 * waveAmplitude); // ลดความร็วลงมื่อปิดไมค์

        const currentAmplitude = wave.baseAmplitude * audioMultiplier * waveAmplitude;

        for (let x = 0; x < width; x += 1) {
          const dx = x / width;
          const offsetY = height / 2;
          
          // เพิ่มความซับซ้อนของการเคลื่อนไหว
          const movement = 
            Math.sin(dx * Math.PI * wave.frequency * 20 + phase * wave.speed) * 
            Math.sin(dx * Math.PI) +
            Math.sin(dx * Math.PI * wave.frequency * 10 + phase * wave.speed * 1.5) * 0.5 +
            Math.sin(dx * Math.PI * wave.frequency * 5 + phase * wave.speed * 0.75) * 0.3 +
            Math.sin(phase * 0.2) * 0.2; // เพิ่มการเคลื่อนไหวแนวตั้ง

          const y = offsetY + movement * currentAmplitude;

          ctx.lineTo(x, y);
        }

        // สร้าง gradient แบบซับซ้อน
        const gradient = ctx.createLinearGradient(0, height/2 - wave.baseAmplitude, 0, height/2 + wave.baseAmplitude);
        const waveColor = wave.color;
        gradient.addColorStop(0, `${waveColor}00`);
        gradient.addColorStop(0.2, `${waveColor}${Math.floor(wave.opacity * 255 * 0.5).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${waveColor}${Math.floor(wave.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.8, `${waveColor}${Math.floor(wave.opacity * 255 * 0.5).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${waveColor}00`);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6; // เพิ่มความหนาเส้น

        // เพิ่ม glow effect
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;

        ctx.stroke();
        ctx.shadowColor = 'transparent';

        // เพิ่ม fill effect แบบซับซ้อน
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // ปรับความเร็วในการเคลื่อนที่
      const phaseSpeed = isListening ? 
        0.15 * (1 + audioLevel / 100) * waveAmplitude : // ปรับตามค่า amplitude
        0.05 * waveAmplitude; // ลดความเร็วลงเมื่อปิดไมค์
      
      phase += phaseSpeed;
      animationFrameId = requestAnimationFrame(drawWave);
    };

    drawWave();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(fadeTimeoutRef.current);
    };
  }, [isListening, audioLevel, waveAmplitude]);

  // ฟังก์ชันสำหรับกำหนดหัวข้อ PIN Screen
  const getPinScreenTitle = () => {
    switch (transactionType) {
      case 'transfer':
        return 'ยืนยันการโอนเงิน';
      case 'statement':
        return 'ขอ Statement ย้อนหลัง 6 เดือน';
      default:
        return 'ยืนยัน PIN';
    }
  };

  // Cleanup เมื่อ component unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-mute effect
  useEffect(() => {
    const handlePopupAutoMute = async () => {
      if ((showPinScreen || showSuccess || showStatementSuccess) && isListening) {
        if (recognitionRef.current) {
          recognitionRef.current?.stop();
          setIsListening(false);
          
          if (transcript.trim()) {
            await callAmityAPI(transcript);
          }
        }
      }
    };

    handlePopupAutoMute();
  }, [showPinScreen, showSuccess, showStatementSuccess]);

  // ในฟังก์ชัน handleSpeechEnd รือทีเรียกเมื่อจบการพูด
  const handleSpeechEnd = async () => {
    if (transcript.trim()) {
      setIsListening(false);  // หยุดการฟังทันที
      const currentTranscript = transcript;
      setTranscript('');  // clear transcript
      await callAmityAPI(currentTranscript);
    }
  };

  // แก้ไขส่วนที่เล่นเสียง
  const playAudioResponse = async (audioBase64) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      // หยุดการฟังและ disable ปุ่มไมค์
      setIsListening(false);
      setIsAudioPlaying(true);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      audioRef.current = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      await audioRef.current.play();

      // เมื่อเสียงเล่นจบ
      audioRef.current.addEventListener('ended', () => {
        setIsAudioPlaying(false);
        audioRef.current = null;
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsAudioPlaying(false);
    }
  };

  return (
    <>
      <Box sx={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />

        {/* Header with Glass Effect */}
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            p: 2,
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0 0 24px 24px',
            boxShadow: '0 4px 30px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/')} sx={{ color: colors.purple }}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FontAwesomeIcon icon={faRobot} style={{ color: colors.purple }} />
                <Typography variant="h6" sx={{ color: colors.purple, fontWeight: 600 }}>
                  AI Friend
                </Typography>
              </Box>
            </Box>
            
            {/* Voice Level Indicator */}
            {isListening && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FontAwesomeIcon 
                  icon={audioLevel > 50 ? faVolumeHigh : faVolumeLow} 
                  style={{ color: colors.purple }} 
                />
                <Box sx={{ 
                  width: 50,
                  height: 4,
                  bgcolor: 'rgba(144,63,152,0.2)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: `${(audioLevel/128)*100}%`,
                    height: '100%',
                    bgcolor: colors.purple,
                    transition: 'width 0.1s'
                  }} />
                </Box>
              </Box>
            )}
          </Box>

          {/* Quick Suggestions */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                onClick={() => handleCommand(suggestion)}
                sx={{
                  bgcolor: 'rgba(144,63,152,0.1)',
                  color: colors.purple,
                  '&:hover': {
                    bgcolor: 'rgba(144,63,152,0.2)',
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          width: '90%',
          maxWidth: 600,
          textAlign: 'center'
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h4" sx={{ 
              mb: 2,
              background: `linear-gradient(45deg, ${colors.purple}, ${colors.blue})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 700
            }}>
              {greeting}
            </Typography>
            <Typography variant="body1" sx={{ color: colors.gray, mb: 3 }}>
              {subGreeting}
            </Typography>

            {/* Text Input Area */}
            {showKeyboard && (
              <Box sx={{ mt: 2 }}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    border: `1px solid ${colors.purple}20`,
                    borderRadius: 3
                  }}
                >
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="พิมพ์ข้อความขอคุณ..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '8px 12px',
                      fontSize: '16px',
                      background: 'transparent'
                    }}
                  />
                  <IconButton 
                    color="primary"
                    onClick={() => {
                      handleCommand(inputText);
                      setInputText('');
                    }}
                  >
                    <FontAwesomeIcon icon={faWandMagicSparkles} />
                  </IconButton>
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Transcript Box */}
        {(transcript || lastTranscript) && (
          <Fade in={Boolean(transcript || lastTranscript)}>
            <Paper
              sx={{
                position: 'absolute',
                bottom: '150px',
                left: 0,
                right: 0,
                margin: 'auto',
                p: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                maxWidth: '80%',
                textAlign: 'center',
                zIndex: 2,
                boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <FontAwesomeIcon 
                icon={faVolumeHigh} 
                style={{ color: colors.purple }} 
              />
              <Typography variant="body1" sx={{ color: colors.purple }}>
                "{transcript || lastTranscript}"
              </Typography>
            </Paper>
          </Fade>
        )}

        {userMessage && (
          <Fade in={Boolean(userMessage)}>
            <Paper
              sx={{
                position: 'absolute',
                bottom: '150px',
                left: 0,
                right: 0,
                margin: 'auto',
                p: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                maxWidth: '80%',
                textAlign: 'center',
                zIndex: 2,
                boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <FontAwesomeIcon 
                icon={faVolumeHigh} 
                style={{ color: colors.purple }} 
              />
              <Typography variant="body1" sx={{ color: colors.purple }}>
                "{userMessage}"
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Control Buttons */}
        <Box sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          gap: 2
        }}>
          {/* Keyboard Toggle Button */}
          <Tooltip title="พิพ์ข้อวาม">
            <IconButton
              onClick={() => setShowKeyboard(!showKeyboard)}
              sx={{
                width: 50,
                height: 50,
                background: showKeyboard 
                  ? `linear-gradient(45deg, ${colors.blue} 30%, ${colors.turquoise} 90%)`
                  : 'rgba(255,255,255,0.8)',
                color: showKeyboard ? 'white' : colors.purple,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
                '&:hover': { transform: 'scale(1.05)' },
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={faKeyboard} />
            </IconButton>
          </Tooltip>

          {/* Main Microphone Button */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.1)'
            }}
          >
            <IconButton
              onClick={toggleListening}
              disabled={isProcessing || isRequesting || showPinScreen || showSuccess || showStatementSuccess || isAudioPlaying}
              sx={{
                width: 60,
                height: 60,
                background: isListening 
                  ? `linear-gradient(45deg, ${colors.coral} 30%, ${colors.orange} 90%)`
                  : `linear-gradient(45deg, ${colors.purple} 30%, ${colors.blue} 90%)`,
                color: 'white',
                '&:hover': { transform: 'scale(1.05)' },
                transition: 'all 0.3s ease',
                position: 'relative',
                opacity: (isProcessing || isRequesting || isAudioPlaying) ? 0.7 : 1
              }}
            >
              {(isProcessing || isRequesting) ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <FontAwesomeIcon 
                  icon={isListening ? faMicrophone : faMicrophoneSlash} 
                  size="lg"
                />
              )}
            </IconButton>
          </Paper>
        </Box>
      </Box>

      {/* PIN Screen */}
      <PinScreen 
        open={showPinScreen}
        onClose={() => {
          setShowPinScreen(false);
          setTransactionType(null);
        }}
        onSuccess={handlePinSuccess}
        title={getPinScreenTitle()}
        recipientName={selectedRecipient}
        transactionType={transactionType}
      />

      {/* Success Dialog สำหรับโอนเงิน */}
      {showSuccess && selectedRecipient && transferAmount > 0 && (
        <SuccessDialog 
          open={showSuccess}
          onClose={handleSuccessClose}
          recipientName={selectedRecipient}
          amount={transferAmount}
        />
      )}

      {/* Success Dialog สำหรับ Statement */}
      <StatementSuccessDialog 
        open={showStatementSuccess}
        onClose={() => {
          setShowStatementSuccess(false);
          setTransactionType(null);
        }}
      />

      {/* Animation styles */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>

      <FreezeDialog
        open={showFreezeDialog}
        onClose={() => {
          setShowFreezeDialog(false);
          setFreezeData(null);
        }}
        data={freezeData}
      />

      <LinkDialog
        open={showLinkDialog}
        onClose={() => {
          setShowLinkDialog(false);
          setLinkData(null);
        }}
        links={linkData}
      />
    </>
  );
}

export default AIAssistant;