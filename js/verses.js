/**
 * Scripture shown in the home page "language" strip. The page picks a random (verse, language) pair every
 * few seconds and never repeats the same verse or the same language twice in a row.
 *
 * To add a verse: add an object with `ref` and `t` (language code -> text). Missing languages are simply
 * skipped. Translations are public-domain editions:
 *   en  World English Bible (Psalm 23:1 uses the KJV)    ko  개역한글 (Korean Revised Version)
 *   es  Reina-Valera 1909                                zh  和合本 (Chinese Union Version, simplified)
 *   fr  Louis Segond 1910                                ru  Synodal Bible
 *   de  Luther 1912                                      it  Diodati
 *   ar  Smith-Van Dyck                                   hi  Hindi Old Version      ur  Urdu Old Version
 * Please have a native reader check any text before relying on it.
 */
window.TOL_VERSE_LANGS = [
  { code: 'en', dir: 'ltr', native: 'English', english: 'English' },
  { code: 'ko', dir: 'ltr', native: '한국어', english: 'Korean' },
  { code: 'es', dir: 'ltr', native: 'Español', english: 'Spanish' },
  { code: 'zh-CN', dir: 'ltr', native: '中文', english: 'Chinese' },
  { code: 'ar', dir: 'rtl', native: 'العربية', english: 'Arabic' },
  { code: 'fr', dir: 'ltr', native: 'Français', english: 'French' },
  { code: 'ru', dir: 'ltr', native: 'Русский', english: 'Russian' },
  { code: 'hi', dir: 'ltr', native: 'हिन्दी', english: 'Hindi' },
  { code: 'de', dir: 'ltr', native: 'Deutsch', english: 'German' },
  { code: 'ur', dir: 'rtl', native: 'اردو', english: 'Urdu' },
  { code: 'it', dir: 'ltr', native: 'Italiano', english: 'Italian' }
];

window.TOL_VERSES = [
  {
    ref: 'John 3:16',
    t: {
      'en': 'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.',
      'ko': '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
      'es': 'Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      'zh-CN': '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。',
      'ar': 'لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.',
      'fr': 'Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle.',
      'ru': 'Ибо так возлюбил Бог мир, что отдал Сына Своего Единородного, дабы всякий верующий в Него, не погиб, но имел жизнь вечную.',
      'hi': 'क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उस ने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे, वह नाश न हो, परन्तु अनन्त जीवन पाए।',
      'de': 'Also hat Gott die Welt geliebt, daß er seinen eingeborenen Sohn gab, auf daß alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.',
      'ur': 'کیونکہ خدا نے دنیا سے اَیسی مُحبّت رکھّی کہ اُس نے اپنا اکلَوتا بیٹا بخش دیا تاکہ جو کوئی اُس پر ایمان لائے ہلاک نہ ہو بلکہ ہمیشہ کی زندگی پائے۔',
      'it': 'Perciocchè Iddio ha tanto amato il mondo, che ha dato il suo unigenito Figliuolo, acciocchè chiunque crede in lui non perisca, ma abbia vita eterna.'
    }
  },
  {
    ref: 'John 1:1',
    t: {
      'en': 'In the beginning was the Word, and the Word was with God, and the Word was God.',
      'ko': '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라',
      'es': 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.',
      'zh-CN': '太初有道，道与神同在，道就是神。',
      'ar': 'فِي الْبَدْءِ كَانَ الْكَلِمَةُ، وَالْكَلِمَةُ كَانَ عِنْدَ اللهِ، وَكَانَ الْكَلِمَةُ اللهَ.',
      'fr': 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.',
      'ru': 'В начале было Слово, и Слово было у Бога, и Слово было Бог.',
      'hi': 'आदि में वचन था, और वचन परमेश्वर के साथ था, और वचन परमेश्वर था।',
      'de': 'Im Anfang war das Wort, und das Wort war bei Gott, und Gott war das Wort.',
      'ur': 'ابتدا میں کلام تھا اور کلام خدا کے ساتھ تھا اور کلام خدا تھا۔',
      'it': 'NEL principio era la Parola, e la Parola era appresso Dio, e la Parola era Iddio.'
    }
  },
  {
    ref: 'Psalm 119:105',
    t: {
      'en': 'Your word is a lamp to my feet, and a light for my path.',
      'ko': '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
      'es': 'Lámpara es á mis pies tu palabra, Y lumbrera á mi camino.',
      'zh-CN': '你的话是我脚前的灯，是我路上的光。',
      'ar': 'سِرَاجٌ لِرِجْلِي كَلاَمُكَ وَنُورٌ لِسَبِيلِي.',
      'fr': 'Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier.',
      'ru': 'Слово Твое — светильник ноге моей и свет стезе моей.',
      'hi': 'तेरा वचन मेरे पाँव के लिये दीपक, और मेरी राह के लिये उजियाला है।',
      'de': 'Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.',
      'ur': 'تیرا کلام میرے قدموں کے لئے چراغ اور میری راہ کے لئے روشنی ہے۔',
      'it': 'La tua parola è una lampana al mio piè, Ed una luce al mio sentiero.'
    }
  },
  {
    ref: 'Matthew 11:28',
    t: {
      'en': 'Come to me, all you who labor and are heavily burdened, and I will give you rest.',
      'ko': '수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라',
      'es': 'Venid á mí todos los que estáis trabajados y cargados, que yo os haré descansar.',
      'zh-CN': '凡劳苦担重担的人，可以到我这里来，我就使你们得安息。',
      'ar': 'تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَالثَّقِيلِي الأَحْمَالِ وَأَنَا أُرِيحُكُمْ.',
      'fr': 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.',
      'ru': 'Придите ко Мне, все труждающиеся и обремененные, и Я успокою вас.',
      'hi': 'हे सब परिश्रम करनेवालो और बोझ से दबे हुए लोगो, मेरे पास आओ; मैं तुम्हें विश्राम दूँगा।',
      'de': 'Kommet her zu mir alle, die ihr mühselig und beladen seid; ich will euch erquicken.',
      'ur': 'اے محنت اٹھانے والو اور بوجھ سے دبے ہوئے لوگو سب میرے پاس آؤ۔ میں تمکو آرام دونگا۔',
      'it': 'Venite a me, voi tutti che siete travagliati ed aggravati, ed io vi darò riposo.'
    }
  },
  {
    ref: 'John 14:6',
    t: {
      'en': 'Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father, except through me.”',
      'ko': '예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라',
      'es': 'Jesus le dice: Yo soy el camino, y la verdad, y la vida: nadie viene al Padre, sino por mí.',
      'zh-CN': '耶稣说：我就是道路、真理、生命；若不藉着我，没有人能到父那里去。',
      'ar': 'قَالَ لَهُ يَسُوعُ: «أَنَا هُوَ الطَّرِيقُ وَالْحَقُّ وَالْحَيَاةُ. لَيْسَ أَحَدٌ يَأْتِي إِلَى الآبِ إِلاَّ بِي».',
      'fr': 'Jésus lui dit: Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.',
      'ru': 'Иисус сказал ему: Я есмь путь и истина и жизнь; никто не приходит к Отцу, как только через Меня.',
      'hi': 'यीशु ने उससे कहा, मार्ग और सत्य और जीवन मैं ही हूँ; बिना मेरे द्वारा कोई पिता के पास नहीं पहुँच सकता।',
      'de': 'Jesus spricht zu ihm: Ich bin der Weg und die Wahrheit und das Leben; niemand kommt zum Vater denn durch mich.',
      'ur': 'یسوع نے اُس سے کہا کہ راہ اور حق اور زندگی میں ہوں۔ کوئی میرے وسیلہ کے بغیر باپ کے پاس نہیں آتا۔',
      'it': 'Gesù gli disse: Io sono la via, la verità, e la vita; niuno viene al Padre se non per me.'
    }
  },
  {
    ref: 'Psalm 23:1',
    t: {
      'en': 'The LORD is my shepherd; I shall not want.',
      'ko': '여호와는 나의 목자시니 내가 부족함이 없으리로다',
      'es': 'Jehová es mi pastor; nada me faltará.',
      'zh-CN': '耶和华是我的牧者，我必不致缺乏。',
      'ar': 'الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ.',
      'fr': 'L’Éternel est mon berger: je ne manquerai de rien.',
      'ru': 'Господь — Пастырь мой; я ни в чем не буду нуждаться.',
      'hi': 'यहोवा मेरा चरवाहा है, मुझे कुछ घटी न होगी।',
      'de': 'Der HERR ist mein Hirte, mir wird nichts mangeln.',
      'ur': 'خداوند میرا چوپان ہے مجھے کمی نہ ہوگی۔',
      'it': 'L’Eterno è il mio pastore, Nulla mi mancherà.'
    }
  }
];
