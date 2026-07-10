# Cryptographic failures

ازيك يا صديقي معدنا مع اليوم الثاني ف رمضان و بورد قرأني جديد (من صفحه 22 حتي 42 ) ومعانا ثغره محببه الي قلبي بصراحه ف قبل ما نبدأ عايزك تصلي بينا ع النبي ونبدأ بسم الله الرحمن الرحيم

## اليوم التاني – Cryptographic Failures 🔐

يعني إيه Cryptographic Failures؟

ثغرة Cryptographic Failures أو إخفاقات التشفير، هي واحدة من أخطر الثغرات في عالم الويب. بمعناها البسيط، الموضوع بيبقى إن البيانات الحساسة بتتعامل بتشفير ضعيف أو حتى بتتخزن من غير تشفير أصلاً. يعني ممكن تلاقي مثلاً كلمات المرور أو معلومات المستخدمين بتتحفظ بشكل مكشوف أو باستخدام خوارزميات مش قوية زي MD 5 أو SHA-1. والنتيجة؟ بياناتك ممكن تتسرق بسهولة من أي هاكر شاطر.  
او ان يبقي ليهم صفحات قديمه ف WebArchive مثلا فيه معلومات حساسه وهم شالوه بس لسا موجود ف Archive

أنا من تجاربي الشخصية في مجال الأمان، واجهت مواقف كتير كان سببها إن المطورين مش واخدين الموضوع بجدية كفاية. ساعات بتلاقي حتى الشركات الكبيرة، اللي المفروض يكون عندها أعلى معايير الأمان، بتستخدم حلول تشفير ضعيفة أو بتخزن البيانات الحساسة من غير تشفير ملائم. عشان كده افضل ف خطواتك الاولي تدور علي كل الملفات المهمه و تبحث علي السورس كود برضه (وانا مجهزلك ادوات ومواقع تساعدك انك تلاقي كل المعلومات و الملفات )

---

## إزاي ممكن نلاقي الثغرة؟

من خلال تجربتي، في شوية طرق وأدوات ممكن تساعدك تكتشف الثغرة دي بسهولة:

فحص الاتصالات:  
لو الموقع مش مفعل HTTPS بشكل صحيح أو مش بيستخدم TLS 1.2/1.3، يبقى فيه فرصة كبيرة لمهاجمة MITM (Man-in-the-Middle). (بس دي مش اوي يعني مش كل المواقع بتقبلها ونادر وجودها اصلا )  
تركايه: استخدم أدوات زي Wireshark أو Burp Suite عشان تراقب حركة المرور وتشوف إذا كان فيه بيانات حساسة بتتبعت على شكل Plaintext.

تحليل الأكواد:  
ابحث في الكود عن أماكن تخزين البيانات الحساسة أو عن خوارزميات التشفير المستخدمة.  
أوقات كتير بتلاقي إن المطورين بيسيبوا مفاتيح التشفير أو API Keys في الكود، خصوصاً في GitHub .

فحص التخزين:  
شوف لو البيانات الحساسة زي كلمات السر أو بيانات العملاء متخزنة في قواعد البيانات من غير تشفير مناسب.

التحقق من الشهادات:  
لو الموقع عنده شهادات SSL/TLS، اتأكد إنها مش منتهية الصلاحية أو مش موثوقة، لإنها ممكن تكون مؤشر على ضعف التشفير.

---

## إزاي نستغل الثغرة؟

Interception & Sniffing:  
لو الاتصالات مش مشفرة كويس، استخدم أدوات زي Bettercap أو MITMf لعترض البيانات وفك تشفيرها. التجربة دي بتحتاج صبر وفهم لطبيعة البروتوكولات.

Brute Force on Hashes:  
لو لقيت كلمات السر مشفرة باستخدام MD 5 أو SHA-1، تقدر تستخدم John the Ripper أو Hashcat لفك التشفير بسرعة. و دايمًا لازم تتأكد إنك جربت الأدوات دي في بيئة اختبار قبل ما تستخدمها في أي تقرير.

استغلال مفاتيح API المكشوفة:  
لما تلاقي مفاتيح API أو أسرار في الكود، استغلها للوصول لخدمات حساسة أو بيانات خاصة بالمستخدمين. في ناس كتير بتعمل ده وتلاقي معلومات قيمة جدًا ممكن تستخدمها كـ POC (Proof of Concept) للتقرير.

Man-in-the-Middle Attack:  
هجوم MITM بيكون فعال لو لقيت اتصال غير مشفر. دايمًا تابع تلاعب الطلبات وراجع الردود بحثًا عن بيانات حساسة.

---

## إزاي نحمي الموقع من Cryptographic Failures؟

الوقاية أحسن بكتير من العلاج. عشان كده، هنا شوية نصايح تساعدك:

تفعيل HTTPS وTLS:  
لازم تستخدم HTTPS مع أحدث بروتوكولات TLS (1.2 أو 1.3) عشان تحمي البيانات أثناء التنقل. ولازم تفعل HSTS لتأكيد أن المتصفح دايمًا يستخدم HTTPS.

استخدام خوارزميات تشفير قوية:  
ابعد عن MD 5 و SHA-1 واستخدم AES-256 لتشفير البيانات الحساسة، وبالنسبة لكلمات المرور، استخدم خوارزميات زي bcrypt أو Argon 2.

إدارة المفاتيح بشكل آمن:  
متخليش مفاتيح التشفير أو الـ API Keys في الكود. استخدم متغيرات البيئة (Environment Variables) أو حلول إدارة الأسرار زي HashiCorp Vault.

مراجعة دورية للكود:  
نفذ اختبارات أمان دورية باستخدام أدوات زي Burp Suite و OWASP ZAP.

تدريب الفرق:  
درب فريقك على أفضل ممارسات الأمان والتشفير، وكن دائمًا على تواصل مع آخر المستجدات في مجال Cybersecurity.

---

## أمثلة واقعية و Write-ups & POC Videos:

Write-ups:

1. [Weak Cryptographic Hash report](https://hackerone.com/reports/77231)

2. [Weak Cryptography for Passwords](https://hackerone.com/reports/260689)

3. [How I found hundreds of secret passwords and API keys on GitHub and then got Banned for trying to notify their owners (writup)](https://medium.com/@CVxTz/how-i-found-hundreds-of-secret-passwords-and-api-keys-on-github-and-then-got-banned-for-trying-to-f6f11f0e15a6)

4. [WRITE UP — TWITTER BUG BOUNTY [Report of my 1 st bugbounty]: “POODLE SSLv 3 bug on multiple twitter smtp servers](http://omespino.com/write-up-twitter-bug-bounty-my-1st-bugbounty-poodle-sslv3-bug-on-multiple-twitter-smtp-servers/)

5. [OWASP Top 10: The Risk of Cryptographic Failures](https://www.hackerone.com/blog/owasp-top-10-risk-cryptographic-failures)

6. [Cryptographic Failures: Understanding and Preventing Vulnerabilities (writups)](https://medium.com/@ajay.monga73/cryptographic-failures-understanding-and-preventing-vulnerabilities-91c8b2c56854)

POC Videos:

[$300 Bounty || Sensitive Information Disclosure || Exploit || POC](https://youtu.be/ZQ8mSfAiloU?si=CMNWJiq5TRrCMvzu)

[How to Perform MITM Attack — Practical Demo](https://www.youtube.com/watch?v=LEPEk5pFffw)

---

## لابات لتحسين مهاراتك:

لو عايز تتعلم أكتر وتطبق عملياً، جرب Labs زي:

[PortSwigger Labs – Cryptographic Failures:](https://portswigger.net/web-security/information-disclosure/exploiting/lab-infoleak-in-error-messages)

[HackTheBox – Weak Encryption Challenge](https://app.hackthebox.com/challenges/6):

[TryHackMe – Cryptography Room:](https://tryhackme.com/room/cryptographyintro)

---

خلصنا بقي فهم وتدريب نخش ع الشغل الي بجد دي حاجات مهمه وهتفيدك لو بتدور علي ال Bug دي لو انت hunter ولو انت backend DEV فخد بالك بقي و انت بتضيف او بترفع شغلك منهم

1️⃣ GitHub – البحث عن الأكواد المسربة

🔍 Google Dorking على GitHub:  
فيه شركات كتير بتنشر بالخطأ ملفات فيها أسرار زي API Keys أو بيانات دخول، وده كنز لأي هاكر أخلاقي.

🔎 Dorks للبحث عن الأكواد الحساسة:

## Get Jooexploit’s stories in your inbox

Join Medium for free to get updates from this writer.

Subscribe

Remember me for faster sign in

📌 مفاتيح API أو أسرار الشركات:

site:github.com "SECRET_KEY" "company_name"    
site:github.com "API_KEY" "company_name"    
site:github.com "mysql password" "company_name"

📌 ملفات البيئة (Environment Files) اللي ممكن يكون فيها بيانات حساسة:

site:github.com "DB_PASSWORD" "company_name"    
site:github.com "config.json" "company_name"    
site:github.com "aws_access_key_id" "company_name"

📌 بحث عام عن الأكواد الخاصة بشركة معينة:

site:github.com company_name

📌 البحث عن الأكواد اللي تم حذفها بس لسه موجودة في الـ commit history:

site:github.com company_name path:.git

📌 البحث عن ملفات التكوين الحساسة (.env, .json, .yaml, .config):

site:github.com "company_name" ext:env    
site:github.com "company_name" ext:json    
site:github.com "company_name" ext:yaml

🛠️ أدوات تساعدك في البحث داخل GitHub:

GitLeaks → أداة قوية بتساعدك تلاقي البيانات الحساسة المسربة في GitHub.

GitRob → بتساعدك تحلل مستودعات GitHub وتكتشف الأكواد المسربة.

---

2️⃣ Google Dorks – البحث في جوجل عن البيانات المكشوفة

لو عايز تلاقي أكواد مسربة أو معلومات حساسة عن شركة معينة، جرب تستخدم Google Dorks:

📌 البحث عن ملفات التكوين الحساسة (.env, .json, .yaml, .config):

site:pastebin.com "company_name" // or use hastebin.com

📌 البحث عن قواعد البيانات المكشوفة:

site:pastebin.com "database password" // or use hastebin.com

📌 البحث عن السيرفرات الضعيفة:

intitle:"index of" "company_name" // or use hastebin.com

—

3️⃣ Public Code Repositories – مستودعات الكود العامة

🔹 [SourceGraph](https://sourcegraph.com/)

🔍 موقع بيساعدك تبحث في أكواد GitHub وGitLab بسهولة، وبيوفر لك فيلتر قوي جدًا للبحث عن الأكواد المسربة.

🔹 [Grep.app](https://grep.app/)

🔍 زي SourceGraph لكنه أسرع في البحث عن الأكواد، ومفيد جدًا لو بتدور على مكتبات أو كود معين.

---

4️⃣ Shodan & Censys – البحث عن الأجهزة والسيرفرات

🔍 [Shodan.io](https://www.shodan.io/)  
ده محرك بحث للسيرفرات المتصلة بالإنترنت، تقدر من خلاله تلاقي خدمات غير مؤمنة أو قواعد بيانات مكشوفة.

🔍 [Censys.io](https://censys.io/)  
بديل لـ Shodan، وبيساعدك تلاقي شهادات SSL والتعرف على الأجهزة المرتبطة بدومين معين.

🔎 أمثلة على البحث:

📌 البحث عن سيرفرات شركة معينة:

org:"Company Name"

📌 البحث عن قواعد بيانات MongoDB المكشوفة:

product:"MongoDB"

📌 البحث عن لوحات تحكم مكشوفة:

http.title:"admin panel"

---

5️⃣ [Wayback Machine](https://web.archive.org/) – البحث عن الإصدارات القديمة للمواقع  
🕵️‍♂️ موقع ممتاز لو عايز تشوف الإصدارات القديمة من موقع معين، وكتير من الثغرات بتكون بسبب أكواد قديمة مازالت متاحة.

📌 استخدم أداة [Waybackurls](https://github.com/tomnomnom/waybackurls) لاستخراج الروابط القديمة لموقع معين:

waybackurls example.com

---

🛠️ أدوات تساعدك في البحث بشكل أسرع

✅ [Amass](https://github.com/OWASP/Amass)

أداة قوية جدًا لجمع المعلومات عن نطاق معين.

✅ [Subfinder](https://github.com/projectdiscovery/subfinder)

بتساعدك تلاقي الـ subdomains بسرعة.

✅ [Photon](https://github.com/s0md3v/Photon)

Web Crawler يجيب بيانات حساسة من المواقع.

✅ [Knockpy](https://github.com/guelfoweb/knock)

بيعمل enumeration للنطاقات الفرعية (subdomains).

✅ [zeusback](https://github.com/zeusvlun/zeusback)

بتدورلك علي كل الملفات المهمه زي pdf,.xlsx

جاهزين لبكرة؟  
الثغرة الجاية هتكون بإذن الله عن Injection Attacks، خليك متابع ومستعد!

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*JMKGnLYMY3g25TNi24pDBg.jpeg)

---
