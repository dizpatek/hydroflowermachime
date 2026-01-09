import React, { useState } from 'react';
import { X, Cpu, Eye, Hand, Activity, Zap, ShieldCheck, Wrench, Settings as SettingsIcon, AlertCircle, Droplets } from 'lucide-react';

interface SystemGuideModalProps {
  onClose: () => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'hardware' | 'calibration' | 'troubleshooting'>('architecture');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Sistem Rehberi</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-700 bg-slate-800/30 overflow-x-auto">
          <TabButton
            active={activeTab === 'architecture'}
            onClick={() => setActiveTab('architecture')}
            icon={<Cpu className="w-4 h-4" />}
            label="Mimari"
          />
          <TabButton
            active={activeTab === 'hardware'}
            onClick={() => setActiveTab('hardware')}
            icon={<Wrench className="w-4 h-4" />}
            label="Donanım"
          />
          <TabButton
            active={activeTab === 'calibration'}
            onClick={() => setActiveTab('calibration')}
            icon={<SettingsIcon className="w-4 h-4" />}
            label="Kalibrasyon"
          />
          <TabButton
            active={activeTab === 'troubleshooting'}
            onClick={() => setActiveTab('troubleshooting')}
            icon={<AlertCircle className="w-4 h-4" />}
            label="Sorun Giderme"
          />
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin text-slate-300 leading-relaxed">
          {activeTab === 'architecture' && <ArchitectureTab />}
          {activeTab === 'hardware' && <HardwareTab />}
          {activeTab === 'calibration' && <CalibrationTab />}
          {activeTab === 'troubleshooting' && <TroubleshootingTab />}
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

// Tab Button Component
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${active
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Architecture Tab (Original Content)
function ArchitectureTab() {
  return (
    <>
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">1. Giriş: Akıllı Bahçıvanınız</h3>
        <p className="text-slate-400 text-lg">
          Otomatik hidroponik bir sistemi, bitkinize gece gündüz, yorulmadan bakan minik bir robot bahçıvan gibi düşünebilirsiniz.
          Bu akıllı bahçıvan, bitkinin ihtiyaç duyduğu her şeyi (su, besin, ışık) tam zamanında ve doğru miktarda vererek onun en sağlıklı şekilde büyümesini sağlar.
        </p>
      </section>

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
                <div className={`absolute -left-[29px] top-1.5 w-4 h-4 rounded-full ${step.color} border-4 border-slate-900 shadow-lg group-hover:scale-110 transition-transform`}></div>
                <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// Hardware Tab
function HardwareTab() {
  return (
    <>
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Donanım Kurulum Kılavuzu</h3>
        <p className="text-slate-400">
          HydroFlower Pro AI sistemi 7 sensör ve 7 aktüatör ile çalışır. Tüm bağlantılar ESP32-C3 üzerinden yapılır.
        </p>
      </section>

      <section className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h4 className="text-lg font-bold text-white mb-4">Pin Bağlantıları</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <h5 className="text-emerald-400 font-bold mb-2">Sensörler</h5>
              <ul className="text-sm space-y-1 text-slate-300">
                <li>• TDS: GPIO 2 (ADC)</li>
                <li>• pH: GPIO 3 (ADC)</li>
                <li>• DS18B20: GPIO 4 (OneWire)</li>
                <li>• DHT22: GPIO 5</li>
                <li>• RTC SDA: GPIO 6</li>
                <li>• RTC SCL: GPIO 7</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <h5 className="text-purple-400 font-bold mb-2">Aktüatörler</h5>
              <ul className="text-sm space-y-1 text-slate-300">
                <li>• Ana Pompa: GPIO 8</li>
                <li>• pH Up: GPIO 9</li>
                <li>• pH Down: GPIO 10</li>
                <li>• Besin: GPIO 18</li>
                <li>• Işık: GPIO 19</li>
                <li>• Humidifier: GPIO 20</li>
                <li>• Fan (PWM): GPIO 21</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-4">Güvenlik Önlemleri</h4>
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 font-bold mb-2">⚠️ Elektrik Güvenliği</p>
            <ul className="text-sm text-red-300 space-y-1">
              <li>• 220V AC bağlantıları sadece SSR üzerinden yapın</li>
              <li>• Tüm 220V bağlantıları izole edin</li>
              <li>• Topraklama bağlantısı yapın</li>
            </ul>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-400 font-bold mb-2">💧 Su Güvenliği</p>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Sensörleri su geçirmez kutulara yerleştirin</li>
              <li>• Elektrik bağlantılarını su seviyesinin üstünde tutun</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

// Calibration Tab
function CalibrationTab() {
  return (
    <>
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Sensör Kalibrasyonu</h3>
        <p className="text-slate-400 mb-6">
          Doğru ölçümler için sensörlerin kalibre edilmesi kritik önem taşır.
        </p>
      </section>

      <section className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="w-6 h-6 text-emerald-400" />
          <h4 className="text-lg font-bold text-white">pH Sensörü Kalibrasyonu</h4>
        </div>
        <ol className="space-y-4 text-slate-300">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="font-medium">pH 4.0 buffer çözeltisine daldırın</p>
              <p className="text-sm text-slate-500">Serial Monitor'den voltaj değerini okuyun</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="font-medium">phCalibration_4 değişkenini güncelleyin</p>
              <code className="text-xs bg-slate-900 px-2 py-1 rounded">float phCalibration_4 = 3.0;</code>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <p className="font-medium">pH 7.0 buffer çözeltisine daldırın</p>
              <p className="text-sm text-slate-500">Aynı işlemi tekrarlayın</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <div>
              <p className="font-medium">phCalibration_7 değişkenini güncelleyin</p>
              <code className="text-xs bg-slate-900 px-2 py-1 rounded">float phCalibration_7 = 2.5;</code>
            </div>
          </li>
        </ol>
      </section>

      <section className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h4 className="text-lg font-bold text-white">TDS Sensörü Kalibrasyonu</h4>
        </div>
        <p className="text-slate-300 mb-4">
          1413 µS/cm (707 ppm) kalibrasyon çözeltisi kullanın. Serial Monitor'den TDS değerini okuyun ve gerekirse formüldeki faktörü ayarlayın.
        </p>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            💡 <strong>İpucu:</strong> Kalibrasyon her 3 ayda bir tekrarlanmalıdır.
          </p>
        </div>
      </section>
    </>
  );
}

// Troubleshooting Tab
function TroubleshootingTab() {
  return (
    <>
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Sorun Giderme</h3>
        <p className="text-slate-400 mb-6">
          Yaygın sorunlar ve çözümleri.
        </p>
      </section>

      <section className="space-y-4">
        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
          <h4 className="text-white font-bold mb-3">❌ Sensör Okumuyor</h4>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>• Bağlantıları kontrol edin</li>
            <li>• Voltaj seviyelerini ölçün (multimetre)</li>
            <li>• Serial Monitor'den debug mesajlarını okuyun</li>
          </ul>
        </div>

        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
          <h4 className="text-white font-bold mb-3">📡 WiFi Bağlanamıyor</h4>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>• SSID ve şifre doğruluğunu kontrol edin</li>
            <li>• Router'ın 2.4GHz bandında olduğundan emin olun</li>
            <li>• ESP32-C3'ü router'a yaklaştırın</li>
          </ul>
        </div>

        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
          <h4 className="text-white font-bold mb-3">💧 Pompa Çalışmıyor</h4>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>• Röle modülü LED'lerini kontrol edin</li>
            <li>• 12V güç kaynağını test edin</li>
            <li>• Manuel röle testini yapın</li>
          </ul>
        </div>

        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
          <h4 className="text-white font-bold mb-3">🔌 WebSocket Bağlantı Hatası</h4>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>• Server IP adresini kontrol edin (main.cpp)</li>
            <li>• Port 3001'in açık olduğundan emin olun</li>
            <li>• Firewall ayarlarını kontrol edin</li>
          </ul>
        </div>
      </section>
    </>
  );
}