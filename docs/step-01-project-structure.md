# STEP 1: إعداد هيكل المشروع الأساسي

## 🎯 Goal of This Step
في هذه الخطوة سنبني **الهيكل الأساسي الاحترافي** لمشروع **Magnet Tag Arena** داخل Roblox Studio، بحيث يكون المشروع جاهز للإضافة التدريجية لاحقًا (Lobby, Rounds, Roles, UI, Shop, Anti-Exploit) بدون فوضى.

## 📁 Where To Create Things
أنشئ العناصر التالية **بالاسم نفسه حرفيًا** داخل Explorer:

- `ReplicatedStorage`
  - `Folder` باسم: **Shared**
  - `Folder` باسم: **Remotes**
- `ServerScriptService`
  - `Folder` باسم: **Server**
- `StarterPlayer`
  - `StarterPlayerScripts`
    - `Folder` باسم: **Client**

ثم أنشئ سكربت الإعدادات:

- `ReplicatedStorage > Shared`
  - `ModuleScript` باسم: **GameConfig**

> نوع السكربت في هذه الخطوة: **Module Script فقط**.

## 💻 Code
ضع الكود التالي داخل `ReplicatedStorage/Shared/GameConfig`:

```lua
local GameConfig = {
	MIN_PLAYERS = 2,
	ROUND_TIME = 60,
	INTERMISSION_TIME = 15,

	ARENA_SPAWN_HEIGHT_BUFFER = 4,
	LASER_KILL_Y_OFFSET = -10,

	MAGNET_TAG_TOUCH_KILL = true,
	MAGNET_COOLDOWN = 8,
	MAGNET_RANGE = 35,

	CURRENCY_WIN_REWARD = 25,
	CURRENCY_SURVIVE_REWARD = 15,
	CURRENCY_TAG_REWARD = 10,
}

return table.freeze(GameConfig)
```

شرح سريع: هذا الملف يجمع كل القيم الأساسية في مكان واحد، و`table.freeze` تمنع تعديلها وقت التشغيل.

## 🧠 What This Code Does
- يعمل كـ **Single Source of Truth** لكل أرقام توازن اللعبة.
- يسهل تعديل الإعدادات لاحقًا بدون لمس عدة سكربتات.
- يقلل أخطاء نسخ القيم بين السيرفر والعميل.

## ✅ How To Test
1. تأكد من إنشاء الفولدرات والأسماء كما هي بالضبط.
2. أنشئ سكربت مؤقت من نوع **Server Script**:
   - المكان: `ServerScriptService > Server`
   - الاسم: `ConfigSmokeTest`
3. ضع هذا الكود:

```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage.Shared.GameConfig)

print("MIN_PLAYERS:", GameConfig.MIN_PLAYERS)
```

4. اضغط **Play** وتأكد من ظهور `MIN_PLAYERS: 2` في Output.
5. احذف `ConfigSmokeTest` بعد نجاح الاختبار لأنه سكربت فحص مؤقت.

## ⚠️ Common Errors & Fixes
- **الخطأ:** `attempt to index nil with 'GameConfig'`
  - **الحل:** تأكد من المسار الصحيح: `ReplicatedStorage > Shared > GameConfig`.
- **الخطأ:** `Module code did not return exactly one value`
  - **الحل:** تأكد أن آخر سطر هو `return table.freeze(GameConfig)`.
- **المشكلة:** خطأ في الأحرف الكبيرة/الصغيرة
  - **الحل:** أسماء العناصر في Roblox حساسة لحالة الأحرف (`Shared` ≠ `shared`).

## 🔐 Anti-Exploit Best Practices
- لا تضع منطق الفوز/الخسارة أو المكافآت في LocalScript.
- السيرفر هو المصدر الوحيد للحكم على النتائج.
- استخدم Remotes فقط للطلبات، وليس لإعطاء صلاحية للعميل يقرر النتائج.
