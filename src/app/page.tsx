'use client';

import React, { useState } from 'react';
import useAudioInput from './hooks/useAudioInput';

export default function Home() {

  const [text, setText] = useState('');
  
  const onDataReceived = async (data: BodyInit) => {
    const rawResponse = await fetch('http://192.168.21.192:4000/upload', {
      method: 'POST',
      body: data
    });
    const response = await rawResponse.json();

    setText(response)
  };

  const { isRecording, startRecording, error } = useAudioInput({
    audio: true,
    timeInMillisToStopRecording: 2000,
    timeSlice: 400,
    onDataReceived
  })
  

  const onClick = () => {
    startRecording();
  };

  const cssClass = `mic cursor-pointer ${isRecording ? 'pulse' : ''}`

  return (
    <div >
        <div className={'container'}>
          <input type='text' value={text} onChange={(e) => setText(e.target.value)} placeholder={isRecording ? 'Listening...': 'Enter text ...'} />
          <span onClick={onClick}>
            <svg className={cssClass} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.0021 2.25004C14.1029 2.25102 15.7502 3.89895 15.7502 6.00004V11.2032C15.7502 13.2973 14.0626 15.0001 12.0002 15.0001C9.93184 15.0001 8.25016 13.2538 8.25016 11.2032V6.0018C8.24794 5.50884 8.34333 5.02031 8.53084 4.56438C8.71861 4.10782 8.99501 3.69302 9.34408 3.34396C9.69315 2.99489 10.1079 2.71848 10.5645 2.53072C11.0205 2.3432 11.509 2.2478 12.0021 2.25004ZM11.9964 3.75003C11.701 3.74854 11.4082 3.80563 11.135 3.91798C10.8618 4.03034 10.6136 4.19574 10.4047 4.40462C10.1959 4.6135 10.0305 4.86171 9.9181 5.13491C9.80575 5.40811 9.74866 5.70087 9.75015 5.99626C9.75016 5.99752 9.75016 5.99878 9.75016 6.00004V11.2032C9.75016 12.4526 10.7872 13.5001 12.0002 13.5001C13.219 13.5001 14.2502 12.484 14.2502 11.2032V6.00004C14.2502 4.72675 13.2735 3.75004 12.0002 3.75004C11.9989 3.75004 11.9976 3.75003 11.9964 3.75003ZM6 8.99988C6.41421 8.99988 6.75 9.33567 6.75 9.74988V11.2499C6.75 14.1357 9.11421 16.4999 12 16.4999C14.8858 16.4999 17.25 14.1357 17.25 11.2499V9.74988C17.25 9.33567 17.5858 8.99988 18 8.99988C18.4142 8.99988 18.75 9.33567 18.75 9.74988V11.2499C18.75 14.7107 16.1143 17.5825 12.75 17.9582V20.2499H15C15.4142 20.2499 15.75 20.5857 15.75 20.9999C15.75 21.4141 15.4142 21.7499 15 21.7499H9C8.58579 21.7499 8.25 21.4141 8.25 20.9999C8.25 20.5857 8.58579 20.2499 9 20.2499H11.25V17.9582C7.88568 17.5825 5.25 14.7107 5.25 11.2499V9.74988C5.25 9.33567 5.58579 8.99988 6 8.99988Z" fill="#3F4043"/>
            </svg>
          </span>
          
        </div>
        { error ? <span className='text-xs text-red-600 flex items-center justify-center mt-4'>{error?.message}</span> : null }
    </div>
  );
}
