

import  { useCallback, useRef, useEffect, useState } from 'react';

const VOICE_MIN_DECIBELS = -35;
const DELAY_BETWEEN_DIALOGUE = 2000;

const defaultConfig = {
    audio: true
};

type Payload = Blob;

type Config = {
    audio: boolean;
    timeSlice?: number
    timeInMillisToStopRecording?: number
    onStop?: () => void;
    onDataReceived?: (payload: Payload) => void
};

function useAudioInput(config: Config = defaultConfig) {
    const mediaChunks = useRef<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const [error, setError] = useState<Error| null>(null);
    let requestId: number;
    let timer: ReturnType<typeof setTimeout>;

    const onRecordingStart = () => mediaChunks.current = [];

    const onRecordingActive = useCallback(({data}: BlobEvent) => {
        if(data) {
            mediaChunks.current.push(data);
            config?.onDataReceived?.(createBlob())
        }
    },[config]);

    const startTimer = () => {
        timer = setTimeout(() => {
            stopRecording();
        }, config.timeInMillisToStopRecording)
    };

    const setupMediaRecorder = ({stream}:{stream: MediaStream}) => {
        mediaRecorder.current = new MediaRecorder(stream)
        mediaRecorder.current.ondataavailable = onRecordingActive
        mediaRecorder.current.onstop = onRecordingStop
        mediaRecorder.current.onstart = onRecordingStart
        mediaRecorder.current.start(config.timeSlice)

    };

    const setupAudioContext = ({stream}:{stream: MediaStream}) => {
        const audioContext = new AudioContext();
        const audioStreamSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.minDecibels = VOICE_MIN_DECIBELS;

        audioStreamSource.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        const domainData = new Uint8Array(bufferLength)

        return {
            domainData,
            bufferLength,
            analyser
        }
    };

    const detectSound = ({ 
        recording,
        analyser,
        bufferLength,
        domainData
    }: {
        recording: boolean
        analyser: AnalyserNode
        bufferLength: number
        domainData: Uint8Array
    }) => {
        let lastDetectedTime = performance.now();
        let anySoundDetected = false;

        const compute = () => {
            if (!recording) {
                return;
            }

            const currentTime = performance.now();

            const timeBetweenTwoDialog =
                anySoundDetected === true && currentTime - lastDetectedTime > DELAY_BETWEEN_DIALOGUE;

            if (timeBetweenTwoDialog) {
                stopRecording();

                return;
            }

            analyser.getByteFrequencyData(domainData);

            for (let i = 0; i < bufferLength; i += 1) {
                if (domainData[i] > 0) {
                    anySoundDetected = true;
                    lastDetectedTime = performance.now();
                }
            }

            requestId = window.requestAnimationFrame(compute);
        };

        compute();

    }

    const startRecording = () => {
        setIsRecording(true);
        navigator.mediaDevices
            .getUserMedia({
                audio: config.audio
            })
            .then((stream) => {
                setupMediaRecorder({stream});
                if(config.timeSlice) {
                    const { domainData, analyser, bufferLength } = setupAudioContext({ stream });
                    detectSound({recording: true, domainData, analyser, bufferLength});
                    startTimer()
                }
            })
            .catch(e => {
                setError(e);
                setIsRecording(false)
            })
    };

    const stopRecording = () => {
        mediaRecorder.current?.stop();
        
        clearTimeout(timer);
        window.cancelAnimationFrame(requestId);

        setIsRecording(false);
        onRecordingStop()
    };

    const createBlob = () => {
        const [chunk] = mediaChunks.current;
        const blobProperty = { type: chunk.type };
        return new Blob(mediaChunks.current, blobProperty)
    }

    const onRecordingStop = () => config?.onStop?.();

    useEffect(() => {
        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const notAvailable = new Error('Your browser does not support Audio Input')
            setError(notAvailable)
        }
        
    },[]);

    return {
        isRecording, startRecording, stopRecording, error
    }
}

export default useAudioInput;
