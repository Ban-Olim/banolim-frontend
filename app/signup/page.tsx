"use client";

import React, { useState } from "react";

export default function SignupPage() {
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");

  // 유효성 검사
  const isNicknameValid = /^[a-z가-힣ㄱ-ㅎㅏ-ㅣ]*$/.test(nickname) && nickname.length <= 8 && nickname.length > 0;
  const showNicknameError = nickname.length > 0 && !isNicknameValid;

  const ageNumber = parseInt(age);
  const isAgeValid = !isNaN(ageNumber) && ageNumber >= 1 && ageNumber <= 100;
  const showAgeError = age.length > 0 && !isAgeValid;

  const isFormValid = isNicknameValid && isAgeValid;

  return (
    <main className="flex min-h-screen flex-col items-center bg-white py-20 px-6">
      <h2 className="text-2xl font-bold text-black mb-16">프로필 설정</h2>

      <div className="w-full max-w-[700px] flex flex-col gap-12">
        
        {/* 닉네임 섹션 */}
        <section className="flex flex-col gap-3">
          <label className="text-b-16sb text-black px-1">닉네임</label>
          <input
            type="text"
            placeholder="닉네임을 입력해 주세요."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={`w-full h-[64px] px-5 rounded-2xl bg-gray-0 border-[2px] transition-all text-b-16r focus:outline-none 
              ${showNicknameError ? 'border-red-main' : 'border-gray-300 focus:border-green-main'}`}
          />
          {showNicknameError ? (
            <p className="text-b-14r text-red-main px-1 font-medium">
              영어 소문자 또는 한글을 이용해 8자이내로 입력해 주세요.
            </p>
          ) : nickname.length > 0 && (
            <p className="text-b-14r text-green-main px-1">사용 가능한 닉네임 입니다.</p>
          )}
        </section>

        {/* 나이 섹션 */}
        <section className="flex flex-col gap-3">
          <label className="text-b-16sb text-black px-1">나이</label>
          <input
            type="number"
            inputMode="numeric" // 모바일에서 숫자 키패드
            placeholder="나이를 입력해 주세요."
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={`w-full h-[64px] px-5 rounded-2xl bg-gray-0 border-[2px] transition-all text-b-16r focus:outline-none 
              ${showAgeError ? 'border-red-main' : 'border-gray-300 focus:border-green-main'}`}
          />
          {showAgeError ? (
            <p className="text-b-14r text-red-main px-1 font-medium">
              유효하지 않은 나이입니다. 1세 이상 입력해주세요
            </p>
          ) : age.length > 0 && (
            <p className="text-b-14r text-green-main px-1">유효한 나이입니다.</p>
          )}
        </section>

        {/* 확인 버튼 */}
        <button
          disabled={!isFormValid}
          className={`w-full h-[64px] mt-8 rounded-2xl font-bold text-lg transition-all shadow-sm
            ${isFormValid 
              ? 'bg-green-main text-white cursor-pointer hover:brightness-95 active:scale-[0.98]' 
              : 'bg-gray-300 text-white cursor-not-allowed'}`}
        >
          확인
        </button>
      </div>
    </main>
  );
}