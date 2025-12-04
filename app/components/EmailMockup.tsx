"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, Shield, Trash2 } from 'lucide-react';

export function EmailMockup() {
  const emails = [
    { from: 'Sarah Martin', subject: 'Ton rapport est disponible now', time: '09:00', color: '#0066FF' },
    { from: 'Alex Bernard', subject: 'Réunion de demain verschoben', time: '09:00', color: '#00CC88' },
    { from: 'Marie Dubois', subject: 'Proposition commerciale', time: '17:00', color: '#FF6B00' },
  ];

  return (
    <motion.div 
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Browser Chrome */}
      <div className="bg-gray-100 rounded-t-2xl p-3 border-2 border-black border-b-0">
        <div className="flex gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 text-[10px] opacity-50">
          mail.naeliv.com
        </div>
      </div>

      {/* Email Interface */}
      <div className="bg-white border-2 border-black rounded-b-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between">
          <h3 className="text-[24px] tracking-tight">Inbox</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[12px]">
            <Clock size={14} />
            <span>09:00 & 17:00</span>
          </div>
        </div>

        {/* Email List */}
        <div className="divide-y-2 divide-gray-200">
          {emails.map((email, index) => (
            <motion.div
              key={index}
              className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: email.color }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Mail size={20} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] opacity-70">{email.from}</p>
                <p className="text-[16px] truncate">{email.subject}</p>
              </div>
              <div className="text-[12px] opacity-50">{email.time}</div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div 
          className="p-4 bg-gray-50 border-t-2 border-black grid grid-cols-3 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="text-center">
            <Shield size={16} className="mx-auto mb-1 text-green-600" />
            <p className="text-[10px] opacity-50">0 Spam</p>
          </div>
          <div className="text-center">
            <Clock size={16} className="mx-auto mb-1 text-blue-600" />
            <p className="text-[10px] opacity-50">2x/jour</p>
          </div>
          <div className="text-center">
            <Trash2 size={16} className="mx-auto mb-1 text-red-600" />
            <p className="text-[10px] opacity-50">Auto-clean</p>
          </div>
        </motion.div>
      </div>

      {/* Floating badges */}
      <motion.div
        className="absolute -right-4 top-1/4 bg-green-500 text-white px-4 py-2 rounded-full text-[12px] shadow-lg"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        0% Spam
      </motion.div>
      <motion.div
        className="absolute -left-4 bottom-1/4 bg-blue-500 text-white px-4 py-2 rounded-full text-[12px] shadow-lg"
        animate={{ x: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      >
        Zen Mode
      </motion.div>
    </motion.div>
  );
}

