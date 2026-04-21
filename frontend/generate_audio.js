/**
 * Audio Generator — downloads MP3 audio files from Google TTS
 * Run:  node generate_audio.js
 *
 * Covers all screens and departments in EN, TA, HI.
 * Files are saved to:  public/assets/audio/
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const audioDir = path.join(__dirname, 'public', 'assets', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const texts = {
  welcome: {
    en: "Welcome to the Smart Civic Service Kiosk. Please select your preferred language to begin.",
    ta: "ஸ்மார்ட் சிவிக் சேவை கியோஸ்கிற்கு வரவேற்கிறோம். தொடங்குவதற்கு உங்கள் மொழியை தேர்ந்தெடுக்கவும்.",
    hi: "स्मार्ट सिविक सेवा कियोस्क में आपका स्वागत है। शुरू करने के लिए कृपया अपनी भाषा चुनें।"
  },
  login: {
    en: "Please enter your mobile number and verify the OTP sent to your phone.",
    ta: "தயவுசெய்து உங்கள் மொபைல் எண்ணை உள்ளிட்டு உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட OTP ஐச் சரிபார்க்கவும்.",
    hi: "कृपया अपना मोबाइल नंबर दर्ज करें और अपने फोन पर भेजे गए ओटीपी को सत्यापित करें।"
  },
  dashboard: {
    en: "Welcome! Please select a service from the dashboard. Options include Electricity, Water, Gas, Municipal, Transport, and Public Health.",
    ta: "வரவேற்கிறோம்! டாஷ்போர்டில் ஒரு சேவையைத் தேர்ந்தெடுக்கவும். மின்சாரம், நீர், எரிவாயு, நகராட்சி, போக்குவரத்து மற்றும் பொது சுகாதாரம் உள்ளிட்ட சேவைகள் உள்ளன.",
    hi: "स्वागत है! डैशबोर्ड से एक सेवा चुनें — बिजली, पानी, गैस, नगर पालिका, परिवहन या सार्वजनिक स्वास्थ्य।"
  },
  electricity: {
    en: "Please select the electricity service you require such as bill payment or meter complaint.",
    ta: "தயவுசெய்து நீங்கள் விரும்பும் மின்சார சேவையைத் தேர்ந்தெடுக்கவும், உதாரணமாக பில் கட்டணம் அல்லது மீட்டர் புகார்.",
    hi: "कृपया बिजली सेवा चुनें जैसे बिल भुगतान या मीटर शिकायत।"
  },
  gas: {
    en: "Please choose the gas or LPG service you want to access.",
    ta: "நீங்கள் அணுக விரும்பும் எரிவாயு அல்லது LPG சேவையைத் தேர்ந்தெடுக்கவும்.",
    hi: "कृपया गैस या एलपीजी सेवा चुनें।"
  },
  water: {
    en: "Please choose the water service you need such as bill payment or new connection.",
    ta: "உங்களுக்குத் தேவையான நீர் சேவையைத் தேர்ந்தெடுக்கவும், உதாரணமாக பில் கட்டணம் அல்லது புதிய இணைப்பு.",
    hi: "कृपया आवश्यक जल सेवा चुनें जैसे बिल भुगतान या नया कनेक्शन।"
  },
  municipal: {
    en: "You are in Municipal Services. You can pay property tax, report garbage issues, or report broken streetlights.",
    ta: "நீங்கள் நகராட்சி சேவைகள் பிரிவில் உள்ளீர்கள். சொத்து வரி செலுத்தவும், குப்பை புகார் அல்லது தெருவிளக்கு புகார் நடக்கலாம்.",
    hi: "आप नगर पालिका सेवाओं में हैं। संपत्ति कर भरें, कचरा या स्ट्रीटलाइट की समस्या रिपोर्ट करें।"
  },
  transport: {
    en: "Welcome to Transport Department services. You can check license status, apply for a learner license, renew your license, pay traffic fines, or update your vehicle address.",
    ta: "போக்குவரத்து துறை சேவைகளுக்கு வரவேற்கிறோம். உரிம நிலை சரிபார்க்க, புதிய இளம் உரிமத்திற்கு விண்ணப்பிக்க, உரிமம் புதுப்பிக்க, போக்குவரத்து அபராதம் செலுத்த அல்லது வாகன முகவரி மாற்ற முடியும்.",
    hi: "परिवहन विभाग में आपका स्वागत है। लाइसेंस की स्थिति जांचें, लर्नर लाइसेंस के लिए आवेदन करें, नवीनीकरण करें, जुर्माना भरें, या पता अपडेट करें।"
  },
  health: {
    en: "Welcome to Public Health Department services. You can book a doctor appointment, check vaccination status, apply for a health scheme, or request a medical certificate.",
    ta: "பொது சுகாதார சேவைகளுக்கு வரவேற்கிறோம். மருத்துவர் நியமன முன்பதிவு, தடுப்பூசி நிலை, சுகாதார திட்டம் அல்லது மருத்துவ சான்றிதழ் கோரலாம்.",
    hi: "लोक स्वास्थ्य विभाग में आपका स्वागत है। डॉक्टर अपॉइंटमेंट बुक करें, टीकाकरण स्थिति देखें, स्वास्थ्य योजना के लिए आवेदन करें या चिकित्सा प्रमाणपत्र प्राप्त करें।"
  },
  complaint: {
    en: "Please select the department and describe your complaint before submitting.",
    ta: "தயவுசெய்து துறையைத் தேர்ந்தெடுத்து சமர்ப்பிக்கும் முன் உங்கள் புகாரை விவரிக்கவும்.",
    hi: "कृपया विभाग का चयन करें और जमा करने से पहले अपनी शिकायत का वर्णन करें।"
  },
  payment: {
    en: "Please confirm the bill details and choose your payment method. Only UPI and Cash payments are accepted at this kiosk.",
    ta: "பில் விவரங்களை உறுதிசெய்து கட்டண முறையைத் தேர்ந்தெடுக்கவும். UPI மற்றும் ரொக்கப் பணம் மட்டுமே ஏற்றுக்கொள்ளப்படும்.",
    hi: "बिल विवरण की पुष्टि करें और भुगतान विधि चुनें। इस कियोस्क पर केवल UPI और नकद भुगतान स्वीकार किए जाते हैं।"
  },
  service_request: {
    en: "Please fill in the details for your service request and submit the form.",
    ta: "உங்கள் சேவை கோரிக்கையின் விவரங்களை நிரப்பவும் மற்றும் படிவத்தை சமர்ப்பிக்கவும்.",
    hi: "अपनी सेवा अनुरोध के लिए विवरण भरें और फ़ॉर्म जमा करें।"
  },
  success: {
    en: "Your request has been successfully completed. Please collect your receipt.",
    ta: "உங்கள் கோரிக்கை வெற்றிகரமாக முடிக்கப்பட்டது. உங்கள் ரசீதை சேகரிக்கவும்.",
    hi: "आपका अनुरोध सफलतापूर्वक पूरा हो गया है। कृपया अपनी रसीद प्राप्त करें।"
  }
};

const getLangCode = (lang) => lang === 'ta' ? 'ta' : lang === 'hi' ? 'hi' : 'en';
const getFileName = (key, lang) => `${key}_${lang === 'en' ? 'en' : lang === 'ta' ? 'tamil' : 'hindi'}.mp3`;

const getTTSUrl = (text, lang) =>
  `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${getLangCode(lang)}&q=${encodeURIComponent(text)}`;

const downloadAudio = (name, lang, text) => new Promise((resolve, reject) => {
  const filename = getFileName(name, lang);
  const dest = path.join(audioDir, filename);

  // Skip if already downloaded
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`  ⏭ Already exists: ${filename}`);
    return resolve();
  }

  const file    = fs.createWriteStream(dest);
  const options = { headers: { 'User-Agent': 'Mozilla/5.0' } };

  const handleResponse = (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      https.get(res.headers.location, options, handleResponse);
      return;
    }
    if (res.statusCode !== 200) {
      return reject(new Error(`HTTP ${res.statusCode} for ${filename}`));
    }
    res.pipe(file);
    file.on('finish', () => file.close(() => {
      // Validate file size (TTS returns small error pages on failure)
      const size = fs.statSync(dest).size;
      if (size < 500) {
        fs.unlinkSync(dest);
        reject(new Error(`File too small (${size}B) for ${filename} — likely blocked`));
      } else {
        resolve();
      }
    }));
    file.on('error', reject);
  };

  https.get(getTTSUrl(text, lang), options, handleResponse).on('error', reject);
});

// ── Validation Report ──────────────────────────────────────────────────────
const validateCoverage = () => {
  console.log('\n📋 Audio Coverage Validation:\n');
  let missing = 0;
  const langs = ['en', 'ta', 'hi'];

  for (const key of Object.keys(texts)) {
    for (const lang of langs) {
      const filename = getFileName(key, lang);
      const filepath = path.join(audioDir, filename);
      const exists   = fs.existsSync(filepath) && fs.statSync(filepath).size > 500;
      const icon     = exists ? '✅' : '❌';
      if (!exists) missing++;
      console.log(`  ${icon} ${filename}`);
    }
  }

  if (missing === 0) {
    console.log('\n✅ All audio files present. Coverage: 100%\n');
  } else {
    console.log(`\n⚠️  ${missing} file(s) missing. Run this script again to retry.\n`);
    console.log('  Note: Missing files will automatically fall back to browser TTS in the UI.\n');
  }
};

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  const args = process.argv.slice(2);

  if (args.includes('--validate')) {
    validateCoverage();
    return;
  }

  console.log('🔊 Downloading audio files for all departments and languages...');
  console.log(`   Output: ${audioDir}\n`);

  let ok = 0, fail = 0;
  for (const [key, langs] of Object.entries(texts)) {
    console.log(`  📁 ${key}`);
    for (const [lang, text] of Object.entries(langs)) {
      try {
        await downloadAudio(key, lang, text);
        console.log(`     ✅ ${getFileName(key, lang)}`);
        ok++;
        // Rate-limit to avoid Google blocking
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.error(`     ❌ ${getFileName(key, lang)}: ${err.message}`);
        fail++;
      }
    }
  }

  console.log(`\n✅ Done! ${ok} succeeded, ${fail} failed.`);
  if (fail > 0) {
    console.log('   Failed files will use browser TTS fallback automatically.\n');
  }
  validateCoverage();
})();
