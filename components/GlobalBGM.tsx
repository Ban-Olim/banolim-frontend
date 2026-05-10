"use client";

import { useEffect, useRef, useState } from "react";

export default function GlobalBGM() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  // 컴포넌트 마운트 시 로컬스토리지에서 볼륨을 가져옵니다.
  useEffect(() => {
    const savedVolume = localStorage.getItem("bgmVolume");
    if (savedVolume !== null) {
      setVolume(Number(savedVolume));
    }
  }, []);

  // 오디오 객체의 볼륨을 업데이트하고 재생을 시도합니다.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      // 볼륨이 0이면 일시정지
      if (volume === 0) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (!isPlaying) {
        // 일단 바로 재생 시도 (브라우저 정책이 허용할 경우 바로 재생됨)
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((e) => {
              console.warn("Autoplay prevented by browser:", e);
              // 자동 재생이 막혔을 경우 상호작용 후 재생되도록 대기
              if (hasInteracted) {
                 // 이미 상호작용이 있었는데 에러가 났다면 재시도
                 audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
              }
            });
        }
      }
    }
  }, [volume, isPlaying, hasInteracted]);

  // 대시보드 설정에서 발생시키는 볼륨 변경 커스텀 이벤트를 리슨합니다.
  useEffect(() => {
    const handleVolumeChange = (e: CustomEvent<number>) => {
      setVolume(e.detail);
    };

    window.addEventListener("bgmVolumeChange", handleVolumeChange as EventListener);
    return () => {
      window.removeEventListener("bgmVolumeChange", handleVolumeChange as EventListener);
    };
  }, []);

  // 브라우저 정책상 오디오 자동 재생이 막힐 수 있으므로,
  // 아무 클릭이나 키보드 입력 등 첫 상호작용 시 강제로 재생을 시작합니다.
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      if (audioRef.current && volume > 0 && !isPlaying) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Fallback BGM Play Error:", e));
      }
    };

    // 마우스 클릭, 터치, 키보드 입력 등 사용자 상호작용 감지
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [isPlaying, volume]);

  // 모든 버튼 클릭 시 효과음 재생
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // button, a 태그, role="button", cursor-pointer 클래스를 가진 요소 클릭 시 효과음 재생
      if (
        target.closest("button") || 
        target.closest("a") || 
        target.closest('[role="button"]') || 
        target.closest('.cursor-pointer')
      ) {
        if (volume > 0) {
          const clickAudio = new Audio("/click.mp3");
          clickAudio.volume = volume / 100;
          clickAudio.play().catch((err) => console.warn("Click sound play error:", err));
        }
      }
    };

    // 캡처링 단계에서 이벤트 리스너를 등록하여 하위 요소의 e.stopPropagation() 에 영향받지 않게 함
    window.addEventListener("click", handleGlobalClick, true);

    return () => {
      window.removeEventListener("click", handleGlobalClick, true);
    };
  }, [volume]);

  // bgm 파일은 /banolim_bgm.mp3 에 존재한다고 가정
  return (
    <audio
      ref={audioRef}
      src="/banolim_bgm.mp3"
      loop
      // 화면에 보이지 않도록 함
      style={{ display: "none" }}
    />
  );
}
