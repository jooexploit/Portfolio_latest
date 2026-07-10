# Broken Access Control 
ها هو قد بدأ السباق وها نحن في اول ايام رمضان ف اللهم اجعلنا ممن عتقت رقابهم من النار في شهر رمضان وتقبل صيامنا يا كريم  
قبل اما نبدأ عايزك تصلي ع النبي كد عشان الحوار هيطول مننا شويه يعني بس قبل م نبدأ حابب اعرفك بما انني هنمشي 30 ثغره ف 30 يوم ف هنزود جنبهم 30 جزء ف 30 يوم ونختم ختمه كد مع بعض  
وفيه برنامج برضه جميل جدا هيساعدك انك تختم ويذكرك ب قرأه القرأن وكمان بتختار لو عايز تختم كام ختمه وف قد اي + الاذكار (صباح، مساء، نوم،... ) وكمان يذكرك بقرأه سوره الكهف يوم الجمعه (بس لازم تفعلها يعني )  
لنك البرنامج  
Android :  
[https://play.google.com/store/apps/details?id=com.khatmah.android](https://play.google.com/store/apps/details?id=com.khatmah.android)  
Ios :  
[https://apps.apple.com/us/app/%D8%AE%D8%AA%D9%85%D8%A9-khatmah-%D9%85%D8%B5%D8%AD%D9%81-%D8%A3%D8%B0%D8%A7%D9%86-%D8%A3%D8%B0%D9%83%D8%A7%D8%B1/id543090051](https://apps.apple.com/us/app/%D8%AE%D8%AA%D9%85%D8%A9-khatmah-%D9%85%D8%B5%D8%AD%D9%81-%D8%A3%D8%B0%D8%A7%D9%86-%D8%A3%D8%B0%D9%83%D8%A7%D8%B1/id543090051)  
يلا بينا نبدأ بقي وخير البدايه بسم الله الرحمن الرحيم انهارده احنا ف اليوم : (1) من شهر رمضان المبارك وهنتكلم عن اول ثغره وهي () احنا لما نيجي نتكلم عن اي ثغره هنبدأ نشوف  
- اي هي الثغره و عباره عن اي  
- ازاي ممكن نلاقيها  
- ازاي نقدر نستغلها  
- و ازاي نقدر نحمي الموقع بتاعنا منها  
- كام writeupكد عشان نشوف حاجات علي ارض الواقع + poc عشان برضه لو مش حابب تقرأ وحابب تتفرج  
- لابات تحلها عشان تتمكن من الثغره  
نبدأ ب اول حاجه وهي

(1) يعني إيه Broken Access Control؟ 🔓

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*zadTVgPYp4pppSshXf2XzQ.jpeg)

Broken acces control Bug 1/30

📌 تعريف الثغرة:

ثغرة Broken Access Control معناها إن التطبيق مش بيتحقق كويس من صلاحيات المستخدمين، وده ممكن يسمح لحد مش مفروض يكون عنده إذن إنه:  
✅ يدخل على صفحات خاصة زي صفحة الأدمن Vertical privilge escalation  
✅ يشوف بيانات ناس تانية Horizontal privilge escalation  
✅ يعدّل أو يمسح حاجات مش من حقه  
✅ ينفذ عمليات حساسة زي تحويل الفلوس أو تغيير الباسوردات

---

⚠️ ليه الثغرة دي خطيرة؟

لأنها ممكن تسبب مشاكل كبيرة زي:  
🔴 تسريب بيانات المستخدمين – حد عادي يقدر يشوف بيانات مش من حقه زي الأسماء، الإيميلات، وأرقام الحسابات.  
🔴 اختراق الحسابات – مهاجم يقدر يعدّل بيانات حسابات تانية أو حتى يتحكم فيها.  
🔴 رفع الصلاحيات (Privilege Escalation) – حد عادي يبقى أدمن ويتحكم في كل حاجة.

💡 ببساطة، الثغرة دي بتحصل لما التطبيق ما يتحققش كويس من مين اللي عامل الطلب ويسمح لحد مش مفروض يكون عنده الصلاحية إنه ينفّذ أوامر خطيرة.

---

(2) إزاي نلاقي الثغرة؟ 🕵️‍♂️

🔍 الطرق اللي ممكن تلاقي بيها الثغرة في أي موقع:

1️⃣ التلاعب في الروابط (Forced Browsing):

جرّب تفتح صفحات المفروض تكون مقفولة، زي صفحات الأدمن.

مثال:

https://example.com/user/dashboard  
https://example.com/admin/dashboard ❌ (مش من حق المستخدم العادي يدخلها)

2️⃣ التعديل على الـ IDs في الطلبات:

جرب تغير User ID وشوف هل تقدر تشوف أو تعدّل بيانات حد تاني.

مثال:

https://example.com/profile?user_id=100  
https://example.com/profile?user_id=101 ❌ (مش المفروض تقدر تشوف حساب حد تاني)

3️⃣ التلاعب في الصلاحيات (Parameter Tampering):

لو الموقع بيستخدم متغير زي role=user في الطلب، جرّب تغيّره لـ role=admin وشوف هل الموقع هيقبل التعديل ولا لأ.

4️⃣ التعديل على الـ Cookies أو الـ JWT Tokens:

## Get Jooexploit’s stories in your inbox

Join Medium for free to get updates from this writer.

Subscribe

Remember me for faster sign in

بعض المواقع بتحدد صلاحيات المستخدم في ملفات Cookies أو JWT Tokens، جرب تعدّل عليهم وشوف هل السيستم بيقبل التغيير.

---

(3) إزاي نستغل الثغرة؟ 🚀

🛠️ طرق استغلال الثغرة في Bug Bounty:

🔴 التلاعب في الروابط او Parameter :  
و دا ب استخدام ادوات كتيير مشهوره زي BurpSuite, arachni, zap proxy, wapiti, acunetix, w 3 af

🔴 او بإستخدام اكستنشن ف البيرب اسمها Autorize ابحث عنها اكتر برضه

---

(4) إزاي نحمي الموقع من الثغرة؟ 🔒

✅ أفضل الطرق لحماية موقعك من Broken Access Control:

1️⃣ استخدم Role-Based Access Control (RBAC):

خلي كل مستخدم ليه صلاحيات محددة ومتأكد منها في الـ Backend.

2️⃣ متستخدمش الـ Frontend بس للحماية:

لو الموقع بيمنع الوصول لصفحة معينة من خلال الواجهة الأمامية، المهاجم ممكن يكشف الرابط بسهولة.

3️⃣ تحقق من صلاحيات كل طلب في الـ Backend:

كل طلب لازم يكون فيه تحقق من المستخدم والصلاحيات بتاعته.

مثال في PHP:

if ($_SESSION['user_role'] !== 'admin') {  
die("Unauthorized Access!");  
}

4️⃣ استخدم Logging & Monitoring:

راقب الطلبات اللي بتحصل وسجّل أي محاولة دخول مش مصرح بيها.

5️⃣ اختبر الموقع بانتظام:

استخدم أدوات زي OWASP ZAP أو Burp Suite عشان تكتشف الثغرات قبل ما يستغلها حد.

---

(5) Writeups  
- [https://cyberweapons.medium.com/a-story-of-a-700-broken-access-control-2ec2c21f6ffe](https://cyberweapons.medium.com/a-story-of-a-700-broken-access-control-2ec2c21f6ffe)  
- [https://infosecwriteups.com/full-team-takeover-678c79842065](https://infosecwriteups.com/full-team-takeover-678c79842065) ( Account takeover, broken acces control)  
- [https://secreltyhiddenwriteups.blogspot.com/2024/07/leaking-all-users-google-drive-files.html?m=1](https://secreltyhiddenwriteups.blogspot.com/2024/07/leaking-all-users-google-drive-files.html?m=1)  
وتقدر تشوف اكتر كمان من هنا  
🔗 [https://pentester.land/writeups/](https://pentester.land/writeups/)  
(5) poc  
- [https://youtu.be/t8v8VA8BjfA?si=mDCSHEf1czHHRpG3](https://youtu.be/t8v8VA8BjfA?si=mDCSHEf1czHHRpG3)  
- [https://youtu.be/oj-GE0mbm5U?si=Q_SdIh0f4MrjZ_uQ](https://youtu.be/oj-GE0mbm5U?si=Q_SdIh0f4MrjZ_uQ)  
- وتقدر تلاقي اكتر برضه لما تكتب ف يوتيوب Broken acces control poc  
(6) labs  
- الغني عن التعريف portswigger

[https://portswigger.net/web-security/access-control](https://portswigger.net/web-security/access-control)  
- owasp juice shop (broken acces control)  
- [https://tryhackme.com/room/owaspbrokenaccesscontrol](https://tryhackme.com/room/owaspbrokenaccesscontrol)

---
