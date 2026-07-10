# Injection Attacks 
  
 بسم الله والصلاه والسلام علي رسول الله ف البدايه كد صلي ع النبي عشان معلومات كتير بس مختصره ف هتتعب عشان تعرف اكتر وتغوص ف المعلومه متنساش ورد انهارده يوم 3 رمضان ومعانا ورد من صفحه (42) الي (62) وبرضه معانا عده ثغرات بس تحت مسمي واحد الا وهو
#### 💉💻 Injection Attacks — خطورة الحقن في التطبيقات 💻💉

ودي من أخطر الثغرات اللي ممكن تقابلها في مجال الـ **Web Security**، وده لإنها بتسمح للمهاجم بتنفيذ أكواد خبيثة مباشرة داخل التطبيق، سواء كان قاعدة بيانات، أو أوامر نظام التشغيل، أو سكريبتات في المتصفح. 🛑

في البوست ده، هشرح أشهر أنواع **الـ Injection Attacks** وازاي نلاقيها، نستغلها، ونحمي مواقعنا منها. 🎯


![Injection Attacks SQLi and Command Injection Diagram](https://miro.medium.com/v2/resize:fit:700/1*i3g9Jc8udouSNAN97vA1Bg.jpeg)

2/30 Injection attacks

## 🔎 1️⃣ SQL Injection (SQLi)

📌 **ايه هي؟**  
بتحصل SQL Injection لما التطبيق بيقبل user input مش متهندله او متفلتره يعني ويدمجها مباشرة في استعلامات قاعدة البيانات، وده يسمح للمهاجم بالتلاعب بالبيانات أو حتى الوصول لبيانات حساسة.

⚡ **أنواع SQL Injection:**

- **Union-Based** ➝ استخراج البيانات باستخدام أوامر `UNION SELECT`.
- **Boolean-Based** ➝ الاعتماد على إجابات True/False لمعرفة البيانات.
- **Time-Based** ➝ استغلال الأوامر `SLEEP()` أو `WAITFOR DELAY` لاستخراج البيانات من خلال التأخير الزمني.
- **Error-Based** ➝ استخراج البيانات من خلال رسائل الخطأ.

🔍 **ازاي تلاقيهاو استغلالها ؟**

- اشهر مثال وهو `' OR '1'='1` ضيفه في أي مكان بياخد إدخال من المستخدم.
- استخدم أدوات زي **sqlmap** أو **Burp Suite** لفحص التطبيق.

🛡 **ازاي تحمي نفسك؟**  
✅ استخدام **Prepared Statements** بدلاً من الاستعلامات الديناميكية.  
✅ تفعيل **Web Application Firewall (WAF)**.  
✅ فلترة وتحقق من المدخلات قبل إدخالها لقاعدة البيانات.

🔗 **كام Writeup للتعلم:** [https://hackerone.com/reports/1046084](https://hackerone.com/reports/1046084) [https://portswigger.net/web-security/sql-injection/cheat-sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)

🎥 **كام POC تتفرج عليه:**

[https://www.youtube.com/playlist?list=PLyr9rSDwI-6PbLor2d1XMifRMNu7y-mOt](https://www.youtube.com/playlist?list=PLyr9rSDwI-6PbLor2d1XMifRMNu7y-mOt)

🛠 **لابات تحلها:**

- [https://tryhackme.com/room/sqlilab](https://tryhackme.com/room/sqlilab)
- [PortSwigger Labs](https://portswigger.net/web-security/all-labs).

## 🔎 2️⃣ Command Injection

📌 **ايه هي؟**  
ثغرة Command Injection بتحصل لما التطبيق بياخد مدخلات مستخدم ويدمجها في أوامر نظام التشغيل بدون فلترة، وده يسمح للمهاجم بتنفيذ أوامر على السيرفر (قريبه من SQLI برضه بس علي حسب ال input دا بيتضاف فين انت المفروض تبقي عارف).

⚡ **أنواع Command Injection:**

- **Blind Command Injection** ➝ يتم اختبار الثغرة من خلال التأثيرات (زي التأخير الزمني `ping -c 5 127.0.0.1`).
- **Error-Based Command Injection** ➝ محاولة استخراج الأخطاء من النظام.
- **Out-of-Band (OOB) Command Injection** ➝ إرسال الطلبات لخارج السيرفر عشان نتحقق من الثغرة.

🔍 **ازاي تلاقيها؟**

- جرّب إدخال `; ls -la` أو `&& whoami` في أي مكان بياخد إدخال نصّي.
- استخدم أدوات زي **Burp Suite Intruder** أو **commix**.

💣 **ازاي تستغلها؟**

- تنفيذ أوامر على السيرفر (`; cat /etc/passwd`).
- فتح **Reverse Shell** للسيطرة على السيرفر (`nc -e /bin/sh`).

🛡 **ازاي تحمي نفسك؟**  
✅ استخدام **allowlist** للمدخلات المقبولة.  
✅ تشغيل التطبيقات بأقل صلاحيات ممكنة.  
✅ تجنب استخدام أوامر النظام المباشرة في الأكواد.


🔗 **كام Writeup للتعلم:**

- [Command Injection Guide](https://owasp.org/www-community/attacks/Command_Injection)
- [HackTricks Command Injection](https://book.hacktricks.xyz/pentesting-web/command-injection/)

🎥 **كام POC تتفرج عليه:**

- [Command Injection Exploit](https://www.youtube.com/watch?v=SuiXxrl1PS4)

🛠 **لابات تحلها:**

- [PortSwigger Labs](https://portswigger.net/web-security/all-labs).
- TryHackMe Rooms مثل **“Injection” و “OverTheWire Bandit”**.

## 🔎 3️⃣ Cross-Site Scripting (XSS)

📌 **ايه هي؟**  
ثغرة بتحصل لما التطبيق يسمح بحقن سكريبتات JavaScript داخل الصفحة بدون فلترة، وده يسمح بسرقة بيانات المستخدم أو تنفيذ أكواد خبيثة.

⚡ **أنواع XSS:**

- **Stored XSS** ➝ الأكواد الضارة بتتخزن في السيرفر وتتنفذ على كل المستخدمين.
- **Reflected XSS** ➝ الأكواد بتنطلق فورًا عند فتح الرابط.
- **DOM-Based XSS** ➝ التنفيذ بيتم داخل متصفح المستخدم بدون طلب للسيرفر.

🔍 **ازاي تلاقيها؟**

- جرّب إدخال `<script>alert(1)</script>` في أي مكان بياخد مدخلات مستخدم.
- استخدم أدوات زي **XSStrike** أو **Burp Suite Scanner**.

💣 **ازاي تستغلها؟**

- سرقة الكوكيز (`document.cookie`).
- خداع المستخدمين بتنفيذ عمليات بدلًا عنهم (**CSRF + XSS**).

🛡 **ازاي تحمي نفسك؟**  
✅ تفعيل **Content Security Policy (CSP)**.  
✅ فلترة المدخلات وإزالة الأكواد الضارة.  
✅ استخدام **HTTPOnly Cookies** لحماية الجلسات.

🔗 **كام Writeup للتعلم:**

- [XSS Cheatsheet — PortSwigger](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)
- [HackTricks XSS](https://book.hacktricks.xyz/pentesting-web/xss-cross-site-scripting/)

🎥 **كام POC تتفرج عليه:**

- [XSS poc](https://www.youtube.com/watch?v=s96Dos8i8Qg)

🛠 **لابات تحلها:**

- **XSS Challenges** على [PortSwigger Labs](https://portswigger.net/web-security/all-labs).
- [TryHackMe: XSS Room](https://tryhackme.com/room/xss).

في النهاية احب اقلك يا صديقي السباك متثقش ف حد

و يا صديقي ال hunter دور علي اي input , parameter لعل و عسي يطلع ماسوره مخرومه من سباك مش شايف شغله كويس اتمني تكون اتبسطت و دي مجرد معلومات بسيطه لسا فيه بحر علم قدامك  
متنساش تتابعني عشان بكرا هنتكلم باذن الله عن

Insecure Design — التصميم غير الآمن

---
