# Second Session PHP 
بسـم اللـه الرحمـن الرحيـم الحمد لله رب العالمين، والصلاة والسلام على سيدنا محمد الصادق الوعد الأمين، اللهم لا علم لنا إلا ما علمتنا، إنك أنت العليم الحكيم، اللهم علمنا ما ينفعنا، وانفعنا بما علمتنا وزدنا علماً

موعدنا انهارده باذن الله مع تاني سيشن من كورس php

ف تعالي قبل اما نبدأ نقسم زي م البشمندس [Islam kabbary](https://www.linkedin.com/in/islam-kabbary-2b35a814b/) قسم

```
php and html
type Juggling 
type Casting 
Operators 
String 
Function
```

ودي العناوين الي هنتكلم فيها باذن الله ف تعالا نبدأ مع اول نقطه

htmlاحنا المره الي فاتت عرفنا ازاي نعمل متغيرات بس المره دي بقي عايزين نطبع ونشكل ب

```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <?php
    $userName = "jooexploit";
    $userName2 = "yousef";
    ?>
    <h2>Welcome back, <?php echo $userName; ?></h2>
    <h2>Welcome back, <?= $userName2; ?></h2>
</body>

</html>
```

عادي جد html بص يسيدي ف الكود دا ف البدايه خالص هنكتب بدايه اي كود

php بعد كد عشان بقي لما نيجي نكتب اي

```
<?php
    $userName = "jooexploit";
    $userName2 = "yousef";
?>
```

بنعمل كد عشان نكتب اي حاجه مش شرط متغيرات بس لا عادي

وبرضه لو حابين نطبع او نكتب حاجه تبقي متغيره مع شويه تشكيل زي اننا نكتبها بخط اكبر مثلا

```
<h2>Welcome back, <?php echo $userName; ?></h2>
<h2>Welcome back, <?= $userName2; ?></h2>
```

echo هنا انا طبعت بطريقتين طريقه عاديه والطريقه التانيه عشان نختصر منقعدش نكتب كل مره

---

نخش بقي على الجزئية التانية وهي:

### type juggling

بص يسيدي، احنا في PHP عندنا حاجه اسمها _type juggling_ ودي معناها إن اللغة نفسها بتحاول تفهم نوع البيانات من غير ما انت تحدده بنفسك، يعني مثلاً لو كتبت:

```
$number = "5" + 10;
echo $number;
```

هيطبعلك 15 مع إن المفروض "5" دي سترينج، بس عشان فيه جمع مع رقم، فـ PHP قالت خلاص هنحول السترينج دا لرقم ونجمعهم على بعض.

طيب يعني ايه دا؟ يعني الـ PHP بتجتهد لوحدها وتقول "اه دا شكله رقم.. طب نحوله لرقم" ودا بنسميه _automatic type conversion_ أو _type juggling_.

مثال تاني:

```
$var = "10 little pigs";
$var2 = $var + 5;
echo $var2; 
```

عارف دا هيطبع ايه؟ هيطبع 15 ليه؟ عشان PHP لقت أول رقم في السترينج وقالت "هنتعامل مع أول رقم موجود بس" والباقي طنشته.

---

### type casting

نيجي بقي للجزء التاني وهو _type casting_

بص دي بقى انت الي بتقول فيها للـ PHP "يا PHP من فضلك اعتبري المتغير دا نوع كذا" ودا بيكون بشكل صريح، زي كدا:

```
$number = (int) "123abc";
echo $number;
```

هيطبعلك 123 ليه؟ عشان انت قولتله (int) يعني حول السترينج دا لرقم صحيح.

في حاجات تاني ممكن تعمللها كاست زي:

- (int)
- (bool)
- (float)
- (string)

مثال تاني:

```
$price = 99.99;
$price = (int) $price;
echo $price; 
```

هيطبعلك 99 لأنه حذف الجزء العشري.

---

### الفرق بين type juggling و type casting

- _type juggling_ → PHP بتتصرف من دماغها
- _type casting_ → انت اللي بتقولها تتصرف ازاي

---

الجزء الي بعده وهو

## Operators

بص يا سيدي، الـ Operators أو "العوامل" دي أدوات بنستخدمها عشان نعمل عمليات على المتغيرات والقيم، سواء عمليات حسابية، منطقية، مقارنة... وهكذا.

فنقسمهم كدا زي ما عملنا فوق:

---

### 1. Arithmetic Operators (العمليات الحسابية)

ودي العوامل اللي بنستخدمها في الحساب:

```
$x = 11;
$y = 2;

// echo $x + $y , "<br>";  // 13
// echo $x * $y , "<br>";  // 22
// echo $x - $y , "<br>";  // 9
// echo $x / $y , "<br>";  // 5.5
// echo $x % $y , "<br>";  // 1 
```

- + للجمع
- - للطرح
- * للضرب
- / للقسمة
- % باقي القسمة

---

### 2. Logical Operators (العمليات المنطقية)

دي لما يكون عندك شرطين أو أكتر وعايز تتأكد إنهم صح أو واحد منهم صح.

```
$age = 20;
$hasID = true;

// var_dump($age >= 18 && $hasID); // true
// var_dump($age >= 18 || $hasID); // true 
```

- && (AND): لازم الشرطين يكونوا صح
- || (OR): يكفي واحد بس يكون صح

---

### 3. String Operators (العمليات على النصوص)

دي لما تحب تجمع بين كذا string:

```
$name = "islam";
echo "Hello " . $name; // Hello islam

$msg = "Hi ";
$msg .= "there!";
echo $msg; // Hi there! 
```

- . للجمع بين النصوص
- .= معناها ضيف على المتغير الحالي

---

### 4. Ternary Operator (عامل الشرط المختصر)

دا اختصار للـ if statement لما تكون بسيطة:

```
$isLogin = false;
echo $isLogin ? "welcome" : "Please Login"; 
```

معناها:

- لو الشرط صح → اطبع "welcome"
- لو الشرط غلط → اطبع "Please Login"

مثال كمان:

```
$age = 10;
$hasID = true;

echo ($age >= 18 && $hasID) ? "User Has ID" : "User Hasnt ID";
```

---

### 5. Comparison Operators (عوامل المقارنة)

بتستخدمهم لما تحب تقارن بين قيمتين:

```
var_dump("5" == 5);   // true - القيمة بس متساوية
var_dump("5" === 5);  // false - القيمة والنوع مختلفين

var_dump(10 > 5);     // true
var_dump(10 < 5);     // false

var_dump("3" < 4);    // true

var_dump("3" != 3);   // false - لأنهم متساويين في القيمة
var_dump("3" !== 3);  // true - لأن النوع مختلف 
```

الفرق بين == و ===:

- == بتقارن القيم بس
- === بتقارن القيم **والنوع**

---

الجزء الي اتكلمنا فيه بعد كد وهو

### Strings in PHP

احنا شفنا إن التعامل مع النصوص (Strings) في PHP مش بس موضوع طباعة متغيرات جوه كلام، لا دا فيه تفاصيل كتير ممكن تفرق معانا في الشغل.

نبدأ بأبسط حاجة:

---

### طباعة المتغيرات جوه String

```
$age = 30;
echo "My age is $age" , "<br>";  // My age is 30
echo 'My age is $age';           // My age is $age 
```

هنا في فرق واضح بين:

- **Double quotes** " " → بتفهم إن فيه متغير وبتطبعه.
- **Single quotes** ' ' → بتطبع الكلام زي ما هو حتى لو فيه متغير.

---

### طباعة علامات التنصيص جوه String

```
echo "my name is \"islam\"";
echo 'my name is "islam"';
echo 'It\'s beautiful day'; 
```

لو عايز تكتب علامة تنصيص (زي ") أو ' جوه نفس نوع الـ quotes، لازم تهربها بعلامة الـ backslash \.

---

### Heredoc

لو عندك نص كبير وعايز تكتبه بشكل منسق، استخدم Heredoc:

```
$name = "Ahmed";
$age = "30";

$mess = <<<TEXT
Hello "$name" 
welcom to the PHP Course
You can start anytime
your age is "$age"
TEXT;

echo $mess; 
```

- Heredoc بتعامل الكلام كأنه جوا double quotes يعني بتفهم المتغيرات.

---

### Nowdoc

نفس فكرة Heredoc بس بتعامل النص كأنه جوا single quotes:

```
$mess = <<<'TEXT'
Hello "$name" 
welcom to the PHP Course
You can start anytime
your age is "$age"
TEXT;

echo $mess; 
```

- هنا مش هيطبع قيمة المتغير، هيطبع الاسم زي ما هو $name.

---

### دوال التعامل مع الـ Strings

### 1. strlen()

تعرف بيها عدد الحروف:

```
$pass = "123456";
echo strlen($pass); // 6 
```

---

### 2. strtoupper() و strtolower()

تغيير شكل الحروف:

```
$name = "ali";
echo strtoupper($name); // ALI

$name = "ALI";
echo strtolower($name); // ali 
```

---

### 3. substr()

تقطع جزء من النص:

```
$title = "Hello World";
echo substr($title, 0, 5);  // Hello

$test = substr($title, 5, 6); //  World
echo strlen($test);          // 6 
```

---

### 4. strpos()

تشوف مكان كلمة معينة في النص:

```
$text = "welcome to PHP";
var_dump(strpos($text, "PHP")); // يطبع رقم البداية للكلمة 
```

لو الكلمة مش موجودة بيرجع false.

---

### 5. str_replace()

تبدل كلمة بكلمة تانية:

```
$text = "This is bad";
echo str_replace("bad", "mostafa", $text); // This is mostafa 
```

_خد بالك الحروف لازم تكون بنفس الحالة (Case Sensitive)_.

---

نيجي بقي لاخر نقطه وهي اكتر نقطه مهمه اتكلم عنها البشمهندس بس قال ان دا حاجه بسيطه جدا عنها و ف المرات الجايه باذن الله نبقي نتكلم عنها اكتر الا وهي

### Functions in PHP

بص يا سيدي، الـ **function** يعني "وظيفة" أو "مجموعة أوامر" بتكتبها مرة، وتقدر تستخدمها في أي وقت بعد كده.

---

### 1. Function بسيطة من غير باراميتر

```
function welcome()
{
    echo "welcome to website";
} 
```

دي فنكشن اسمها welcome، كل اللي بتعمله إنها تطبع جملة معينة، ومفيهاش أي مدخلات (باراميترز).

لو حبيت تنفذها، بتكتب بس اسمها كده:

```
welcome(); 
```

---

### 2. Function فيها باراميتر (Parameter)

```
function greet($name)
{
    echo "Hello $name";
} 
```

دي بقى فنكشن بتاخد **باراميتر** اسمه $name، ولما تنادي عليها وتديها اسم، هتطبع جملة ترحيب بالاسم ده.

مثلاً:

```
greet("sara");  // Hello sara 
```

---

### 3. Function بترجع قيمة (Return)

```
function add($x, $y)
{
    return $x + $y;
} 
```

دي فنكشن اسمها add، بتاخد رقمين وتعملهم جمع، وبترجع الناتج باستخدام return.

يعني لما تنادي عليها، النتيجة بتتخزن:

```
$sum = add(10, 5);
echo $sum; // 15 
```

---

### كد نكون خلصنا السيشن التانيه ف php القاك المره القادمه

وف النهايه احب اقلك
✨ Not the first, Not the end, It’s an endless way! ✨

---
