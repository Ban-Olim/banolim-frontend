"use client";

import React from 'react';
import Link from 'next/link';

interface MenuCardProps {
    title: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    href: string;
}

export default function MenuCard({ title, bgColor, borderColor, icon, href }: MenuCardProps) {
    return (
        <Link
            href={href}
            className={`
        ${bgColor}
        relative w-full aspect-[3/4.5] /* 세로 비율 약간 늘림 */
        rounded-[40px]
        flex flex-col items-center justify-center 
        gap-8 /* 간격 늘림 */
        shadow-[0_10px_20px_rgba(0,0,0,0.05)]
        hover:shadow-xl
        transform hover:-translate-y-2 transition-all duration-300
        border-4 border-white/50
        group cursor-pointer
      `}
        >
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white/90 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                {/* 이모지 크기 확대 */}
                <span className="text-6xl sm:text-7xl text-gray-800 leading-none">
                    {icon}
                </span>
            </div>

            {/* [핵심 수정] 디자인 시스템 Title 32 Bold 적용 */}
            <span className="font-display type-title-32 text-gray-900 text-center break-keep px-4 leading-tight mt-2">
                {title}
            </span>
        </Link>
    );
}