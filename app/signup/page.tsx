"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 유효성 검사
  // 백엔드 정규식과 동일: 영어 소문자 또는 완성형 한글, 1~8자
  const isNicknameValid = /^[a-z가-힣]{1,8}$/.test(nickname);
  const showNicknameError = nickname.length > 0 && !isNicknameValid;

  const ageNumber = parseInt(age);
  const isAgeValid = !isNaN(ageNumber) && ageNumber >= 7 && ageNumber <= 13;
  const showAgeError = false;

  const isFormValid = isNicknameValid && isAgeValid;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    setError("");
    try {
      await api.updateProfile({ nickname, age: ageNumber });
      router.push("/main");
    } catch {
      setError("프로필 설정에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

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
              ${showNicknameError ? "border-red-main" : "border-gray-300 focus:border-green-main"}`}
          />
          {showNicknameError ? (
            <p className="text-b-14r text-red-main px-1 font-medium">
              영어 소문자 또는 한글(완성형)을 이용해 8자 이내로 입력해 주세요.
            </p>
          ) : (
            nickname.length > 0 && (
              <p className="text-b-14r text-green-main px-1">
                사용 가능한 닉네임 입니다.
              </p>
            )
          )}
        </section>

        {/* 나이 섹션 */}
        <section className="flex flex-col gap-3">
          <label className="text-b-16sb text-black px-1">나이</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="나이를 입력해 주세요."
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={`w-full h-[64px] px-5 rounded-2xl bg-gray-0 border-[2px] transition-all text-b-16r focus:outline-none
              ${showAgeError ? "border-red-main" : "border-gray-300 focus:border-green-main"}`}
          />
          {age.length > 0 && !isAgeValid ? (
            <p className="text-b-14r text-red-main px-1 font-medium">
              7세 이상 13세 이하만 입력 가능합니다.
            </p>
          ) : (
            age.length > 0 && isAgeValid && (
              <p className="text-b-14r text-green-main px-1">유효한 나이입니다.</p>
            )
          )}
        </section>

        {error && (
          <p className="text-b-14r text-red-main px-1 font-medium -mt-6">
            {error}
          </p>
        )}

        {/* 확인 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className={`w-full h-[64px] mt-8 rounded-2xl font-bold text-lg transition-all shadow-sm
            ${isFormValid && !isLoading
              ? "bg-green-main text-white cursor-pointer hover:brightness-95 active:scale-[0.98]"
              : "bg-gray-300 text-white cursor-not-allowed"}`}
        >
          {isLoading ? "저장 중..." : "확인"}
        </button>
      </div>
    </main>
  );
}
