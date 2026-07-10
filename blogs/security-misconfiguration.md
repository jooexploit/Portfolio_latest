# Security Misconfiguration

بسم الله والصلاه والسلام علي رسول الله ف البدايه كد صلي ع النبي و عايزك تركز وتحاول تدور اكتر عشان دي تركيزها مش عليك ك مبرمج بس عليك ك hunter أكتر برضه او لو انت ليك ف ops وانا متكلم ب اختصار شديد يعني متنساش ورد انهارده يوم 4 رمضان ومعانا ورد من صفحه (82) الي (102) **🔴 Security Misconfiguration — سوء التهيئة الأمنية 🔴**

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*ML9lwtQ7u6xCyrzLHo_-1Q.jpeg)

4/30 Security Misconfiguration

💡 **ايه هي ثغرات Security Misconfiguration؟**  
ثغرات **Security Misconfiguration** بتحصل لما يكون فيه إعدادات غير آمنة في السيرفرات أو التطبيقات، زي استخدام الإعدادات الافتراضية، كشف المعلومات الحساسة، أو السماح بصلاحيات زائدة للمستخدمين. المشكلة إن الأخطاء دي بتفتح باب واسع للهجمات بدون الحاجة لاستغلال ثغرات معقدة.

🔎 **ازاي ممكن نلاقيها؟**

- فحص الردود من السيرفر و نشوف لو فيه **Headers** أو **Error Messages** بتكشف معلومات حساسة.
- تجربة الوصول لصفحات **Admin panels** أو **Debugging pages** اللي المفروض تكون مخفية.
- مراجعة **.git**, **.env**, و **configuration files** لو كانت متاحة للعامة.
- استخدام أدوات زي **Nikto, Nmap, WhatWeb, Burp Suite** لفحص الإعدادات المفتوحة.

🎯 **ازاي نقدر نستغلها؟**

- استغلال **Debug Mode** لو مفعل للكشف عن الأخطاء والمعلومات الحساسة.
- التلاعب في **Headers** عشان نشوف إعدادات الحماية ومدى قوتها.
- الدخول إلى صفحات الإدارة لو كانت متاحة بدون تسجيل دخول.
- استخراج بيانات سرية من ملفات التهيئة أو السجلات المكشوفة.

🛡 **ازاي نقدر نحمي موقعنا منها؟**  
✅ تعطيل وضع **Debug Mode** في بيئة الإنتاج.  
✅ التأكد من ضبط الصلاحيات بحيث يكون لكل مستخدم الحد الأدنى من الصلاحيات اللي يحتاجها فقط.  
✅ إخفاء الملفات الحساسة ومنع الوصول إليها من خلال إعدادات السيرفر.  
✅ مراجعة إعدادات الأمن بشكل دوري وضبط **Security Headers** بشكل صحيح.  
✅ تحديث الأنظمة والمكتبات المستخدمة بشكل مستمر.

## Get Jooexploit’s stories in your inbox

Join Medium for free to get updates from this writer.

Subscribe

Remember me for faster sign in

📜 **كام Writeups عشان تشوف أمثلة حقيقية؟**

- [Security Misconfiguration](https://root-x.dev/blog/article/Security-Misconfiguration)
- [TryHackMe — OWASP Top 10 — Security Misconfiguration](https://katjah-smith.medium.com/tryhackme-owasp-top-10-security-misconfiguration-a04563af510c)
- [report](https://hackerone.com/reports/230648)

📺 **POCs لو مش حابب تقرأ وعايز تتفرج؟**

- [فيديو 1](https://youtu.be/ggbCz2tyTEM?si=geZVCHgjR_K8FRah)
- [فيديو 2](https://youtu.be/BH05FGzLy_s?si=xyad5q-ITWEKY3Cm)

🖥 **لابات تحلها عشان تتمكن من الثغرة؟**  
🔹 PortSwigger Labs — Security Misconfiguration  
🔹 Hack The Box — Misconfiguration Challenges  
🔹 TryHackMe — Security Misconfiguration Path

🚀 **سوء التهيئة الأمنية تعتبر من أكتر الثغرات انتشارًا بسبب أخطاء بشرية بسيطة، بس تأثيرها بيكون كارثي! راجع إعدادات موقعك ومتخليش حاجة مكشوفة بدون داعي.**

ومتنساش تتابعني عشان بكرا باذن الله هيبقي معانا

Vulnerable and Outdated Components — استخدام مكونات قديمة غير آمنة

---
