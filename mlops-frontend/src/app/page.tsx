'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-blue-900/30 z-10"></div>
          <Image
            src="/factory-bg.jpg"
            alt="Smart Factory Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
        </div>
        
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            스마트 제조의 미래
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 mb-8"
          >
            AI 기반 제조 프로세스 최적화로 생산성을 혁신하세요
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300">
              시작하기
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "실시간 모니터링",
                description: "생산 라인의 모든 지표를 실시간으로 모니터링하고 분석합니다.",
                icon: "📊"
              },
              {
                title: "예측 유지보수",
                description: "AI가 장비 상태를 예측하여 최적의 유지보수 일정을 제안합니다.",
                icon: "🔧"
              },
              {
                title: "품질 관리",
                description: "머신러닝 기반의 품질 검사로 불량률을 최소화합니다.",
                icon: "✨"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            AI 기반 제조 혁신으로 더 스마트한 공장을 만들어보세요
          </p>
          <Link href="/register" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
            무료로 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
