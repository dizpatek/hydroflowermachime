import React from 'react';
import { X, Cpu, Eye, Hand, Activity, Zap, ShieldCheck } from 'lucide-react';

interface SystemGuideModalProps {
  onClose: () => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Sistem Mimarisi ve Donanım Rehberi</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin text-slate-300 leading-relaxed">
          
          {/* Section 1: Intro */}
          <section>
            <h3 className="text-2xl font-bold text-white mb-4">1. Giriş: Akıllı Bahçıvanınız</h3>
            <p className="text-slate-400 text-lg">
              Otomatik hidroponik bir sistemi, bitkinize gece gündüz, yorulmadan bakan minik bir robot bahçıvan gibi düşünebilirsiniz. 
              Bu akıllı bahçıvan, bitkinin ihtiyaç duyduğu her şeyi (su, besin, ışık) tam zamanında ve doğru miktarda vererek onun en sağlıklı şekilde büyümesini sağlar.
            </p>
          </section>

          {/* Section 2: Brain */}
          <section className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">2. Sistemin Beyni: ESP32-C3</h3>
            </div>
            <p className="mb-4">
              ESP32-C3, tüm operasyonun yönetildiği, komutların verildiği ve kararların alındığı merkezdir. Tıpkı bir beyin gibi, çevresinden bilgi toplar ve vücudun diğer kısımlarını yönetir.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-mono font-bold mt-1">VERİ TOPLAMA</span>
                <span>Sensörlerden gelen pH, besin yoğunluğu ve sıcaklık bilgilerini anlık okur.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold mt-1">KARAR VERME</span>
                <span>Okunan değerleri, mevcut büyüme fazı (VEG/FLOWER) için tanımlanmış hedeflerle karşılaştırır.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-mono font-bold mt-1">KOMUT</span>
                <span>Pompaları, ışıkları veya fanları çalıştırarak sistemi ideal koşullara getirir.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Sensors */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">3. Duyu Organları: Sensörler</h3>
            </div>
            <p className="mb-4 text-slate-400">
              Sensörler sistemin gözleri, burnu ve parmaklarıdır. Suyun ve ortamın durumunu ölçerek beyne rapor ederler.
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-700 shadow-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-200 uppercase font-bold text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Sensör</th>
                    <th className="p-4">Görev</th>
                    <th className="p-4 hidden sm:table-cell">Kritik Önemi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">pH (PH4502C)</td>
                    <td className="p-4">Asitlik/Bazlık ölçümü</td>
                    <td className="p-4 hidden sm:table-cell text-slate-400">Yanlış pH besin kilitlenmesine yol açar.</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-yellow-400">TDS</td>
                    <td className="p-4">Besin Yoğunluğu</td>
                    <td className="p-4 hidden sm:table-cell text-slate-400">Bitkinin "aç" veya "tok" olduğunu bildirir.</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-red-400">Sıcaklık (DS18B20)</td>
                    <td className="p-4">Su Sıcaklığı</td>
                    <td className="p-4 hidden sm:table-cell text-slate-400">25°C üzeri kök çürümesi riskini artırır.</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">Şamandıra</td>
                    <td className="p-4">Su Seviyesi</td>
                    <td className="p-4 hidden sm:table-cell text-slate-400">Pompaların yanmasını ve taşmayı önler.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Actuators */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Hand className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Peristaltik Pompalar (Cerrah)</h3>
              </div>
              <p className="text-sm mb-4 text-slate-300">Hassas dozlama yapan "cerrah eller". Sabırlı bir strateji izler.</p>
              <ul className="text-sm space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span><strong>Mikro Doz:</strong> Sadece 1.5 saniye çalışma.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span><strong>Bekleme:</strong> Karışım için 5 dakika (DOSE_DELAY).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span><strong>Güvenlik:</strong> A ve B besinleri asla aynı anda verilmez.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Sirkülasyon Pompası</h3>
              </div>
              <p className="text-sm mb-4 text-slate-300">Besinli suyu sürekli dolaştırarak taze tutar.</p>
              <ul className="text-sm space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                  <span>Oksijen oranını artırır.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                  <span>Besinlerin çökmesini engeller.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                  <span>Her kökün eşit beslenmesini sağlar.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Loop */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">5. Çalışma Döngüsü (Loop)</h3>
            </div>
            <div className="relative p-2">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-slate-700 via-slate-700 to-transparent"></div>
              <div className="space-y-8 pl-10">
                {[
                  { title: "Oku", desc: "Sensörlerden pH: 6.2, TDS: 750 verisi alınır.", color: "bg-emerald-500" },
                  { title: "Karşılaştır", desc: "Hedef pH 6.0. Mevcut değer sınırı aşmış.", color: "bg-blue-500" },
                  { title: "Harekete Geç", desc: "pH Down pompası 1.5 sn çalıştırılır. 5 dk bekleme başlar.", color: "bg-purple-500" },
                  { title: "Güvenlik", desc: "Su seviyesi ve akış kontrol edilir. Hata varsa sistem durur.", color: "bg-red-500" },
                  { title: "Tekrarla", desc: "Sistem 5 saniye bekler ve başa döner.", color: "bg-orange-500" }
                ].map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[29px] top-1.5 w-4 h-4 rounded-full ${step.color} border-4 border-slate-900 shadow-lg shadow-${step.color}/20 group-hover:scale-110 transition-transform`}></div>
                    <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-900/20"
          >
            Anlaşıldı, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};