-- 譜面係数（coef）の更新SQL（修正版）
-- JSONの数値difficulty を文字列difficultyに対応させて更新
-- 3=HYPER, 4=ANOTHER, 10=LEGGENDARIA

-- まず、coefカラムが存在しない場合は追加
ALTER TABLE songs ADD COLUMN IF NOT EXISTS coef DECIMAL(6, 4);

-- 各楽曲のcoef値を更新（difficulty: 4 → ANOTHER）
UPDATE songs SET coef = 1.1084 WHERE title = '#MAGiCVLGiRL_TRVP_B3VTZ' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2799 WHERE title = '†渚の小悪魔ラヴリィ～レイディオ†(IIDX EDIT)' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9846 WHERE title = '199024club -Re:BounceKiller-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2869 WHERE title = '255' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.5027 WHERE title = '3y3s' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2659 WHERE title = 'A' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.6437 WHERE title = 'AA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3862 WHERE title = 'AA -rebuild-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3275 WHERE title = 'Adularia' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1536 WHERE title = 'ALBIDA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.5362 WHERE title = 'Almagest' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1992 WHERE title = 'ANCHOR' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1466 WHERE title = 'Ancient Scapes' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4468 WHERE title = 'Antigravity' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0592 WHERE title = 'AO-1' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1331 WHERE title = 'Apocalypse' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9526 WHERE title = 'Arca' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2937 WHERE title = 'Bad Maniacs' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1833 WHERE title = 'BITTER CHOCOLATE STRIKER' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0522 WHERE title = 'BLACK.by X-Cross Fade' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1485 WHERE title = 'BLUE DRAGON(雷龍RemixIIDX)' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0685 WHERE title = 'BLUE MIRAGE' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2696 WHERE title = 'Blue Spring Express' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0716 WHERE title = 'Boomy and The Boost' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1765 WHERE title = 'Broken' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.6145 WHERE title = 'Broken Sword' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2146 WHERE title = 'Candy Galy' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1297 WHERE title = 'Carmina' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2111 WHERE title = 'Carry Me Away' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2566 WHERE title = 'Catch Our Fire!' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9738 WHERE title = 'Caterpillar' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3093 WHERE title = 'Chrono Diver -PENDULUMs-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1744 WHERE title = 'cinder' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.43 WHERE title = 'Close the World feat.a☆ru' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.988 WHERE title = 'CODE:1 [revision1.0.1]' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9588 WHERE title = 'Colorful Cookie' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.275 WHERE title = 'Colors (radio edit)' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0324 WHERE title = 'Concertino in Blue' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4466 WHERE title = 'Confiserie' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2035 WHERE title = 'Dances with Snow Fairies' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3952 WHERE title = 'DARK LEGACY' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3588 WHERE title = 'dAuntl3ss' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1488 WHERE title = 'DAY DREAM' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0795 WHERE title = 'DEADHEAT' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1671 WHERE title = 'DEATH†ZIGOQ ～怒りの高速爆走野郎～' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.151 WHERE title = 'Despair of ELFERIA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3359 WHERE title = 'Devil''s Gear' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9805 WHERE title = 'Devilz Staircase' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.377 WHERE title = 'DIAMOND CROSSING' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3766 WHERE title = 'DIAVOLO' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0231 WHERE title = 'DOMINION' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3589 WHERE title = 'DORNWALD ～Junge～' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3504 WHERE title = 'Dr. Chemical & Killing Machine' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.5329 WHERE title = 'Drastic Dramatic' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9346 WHERE title = 'DropZ-Line-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2075 WHERE title = 'DRUNK MONKY' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1112 WHERE title = 'DUE TOMORROW' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3105 WHERE title = 'Dynamite' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.067 WHERE title = 'EBONY & IVORY' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3001 WHERE title = 'ECHIDNA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0121 WHERE title = 'ELECTRIC MASSIVE DIVER' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3535 WHERE title = 'Elemental Creation' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2345 WHERE title = 'EMERALDAS' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8534 WHERE title = 'encounter' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.98 WHERE title = 'entelecheia' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1337 WHERE title = 'eRAseRmOToRpHAntOM' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1286 WHERE title = 'EVANESCENT' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1928 WHERE title = 'Evans' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2041 WHERE title = 'EXUSIA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.305 WHERE title = 'F' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0395 WHERE title = 'FAKE TIME' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2248 WHERE title = 'fallen leaves -IIDX edition-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9068 WHERE title = 'FANTASTIC THREE' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0489 WHERE title = 'Fascination MAXX' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0795 WHERE title = 'Feel The Beat' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0993 WHERE title = 'fffff' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9648 WHERE title = 'FIRE FIRE' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0799 WHERE title = 'Flashes' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3591 WHERE title = 'FUZIN RIZIN' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.5486 WHERE title = 'G59' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2228 WHERE title = 'GAIA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2909 WHERE title = 'GENE' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0387 WHERE title = 'gigadelic' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2951 WHERE title = 'Go Ahead!!' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9531 WHERE title = 'Go Beyond!!' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2205 WHERE title = 'Godspeed' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2273 WHERE title = 'GOLDEN CROSS' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8552 WHERE title = 'GO OVER WITH GLARE -ROOTAGE 26-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0106 WHERE title = 'Grand Chariot' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0995 WHERE title = 'Gravigazer' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4016 WHERE title = 'GuNGNiR' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0482 WHERE title = 'HADES' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.306 WHERE title = 'HAERETICUS' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3995 WHERE title = 'HARD BRAIN' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2239 WHERE title = 'Highcharge Divolt' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1914 WHERE title = 'Hollywood Galaxy' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9502 WHERE title = 'ICARUS' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8142 WHERE title = 'Idola' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0183 WHERE title = 'Illusionary Waterlily' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.987 WHERE title = 'IMPLANTATION' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1894 WHERE title = 'Initiation' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.7966 WHERE title = 'Innocent Walls' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9035 WHERE title = 'INSOMNIA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1525 WHERE title = 'Invitation from Mr.C' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9638 WHERE title = 'invoker' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1248 WHERE title = 'IX' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9508 WHERE title = 'JOMANDA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2235 WHERE title = 'KAISER PHOENIX' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2229 WHERE title = 'KILL EACH OTHER' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2267 WHERE title = 'Konzert V' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.374 WHERE title = 'L.F.O' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.109 WHERE title = 'LASER CRUSTER' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1383 WHERE title = 'Last Dance' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8863 WHERE title = 'Lethal Weapon' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1662 WHERE title = 'Level One' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0809 WHERE title = 'Liberation' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2764 WHERE title = 'Life Is A Game ft.DD"ナカタ"Metal' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2608 WHERE title = 'Little Star' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2995 WHERE title = 'LOST TECHNOLOGIE' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1496 WHERE title = 'M4K3 1T B0UNC3' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9538 WHERE title = 'Macho Monky' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2888 WHERE title = 'Mare Nectaris' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1284 WHERE title = 'MENDES' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2238 WHERE title = 'Monopole.' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1306 WHERE title = 'moon_child' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9608 WHERE title = 'mosaic' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2572 WHERE title = 'NEO GENERATOR SEVEN' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3077 WHERE title = 'neu' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2139 WHERE title = 'New Castle Legions' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2609 WHERE title = 'Nightmare before oversleep' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1086 WHERE title = 'NINJA IS DEAD IIDX ver.' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.247 WHERE title = 'NITROUS CANNON' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2796 WHERE title = 'NNRT' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2053 WHERE title = 'NZM' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.985 WHERE title = 'One More Lovely' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8821 WHERE title = 'one or eight' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0559 WHERE title = 'ONIGOROSHI' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0725 WHERE title = 'oratio' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1936 WHERE title = 'OTENAMI Hurricane' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2768 WHERE title = 'Painful Fate' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0277 WHERE title = 'Papilio ulysses' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2725 WHERE title = 'PARADISE LOST' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9144 WHERE title = 'PARANOiA ～HADES～' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4609 WHERE title = 'perditus†paradisus' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.07 WHERE title = 'Persephone' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2292 WHERE title = 'Plan 8' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1849 WHERE title = 'PLEASE DON''T GO' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0034 WHERE title = 'Please Welcome Mr.C' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9604 WHERE title = 'POSSESSION' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4694 WHERE title = 'Proof of the existence' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9468 WHERE title = 'PUNISHER' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2982 WHERE title = 'Quakes' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1512 WHERE title = 'quaver♪' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1867 WHERE title = 'quell～the seventh slave～' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9886 WHERE title = 'ra''am' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1615 WHERE title = 'rage against usual' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.282 WHERE title = 'RAIN' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3794 WHERE title = 'Rampage' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0887 WHERE title = 'Raspberry Railgun' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1142 WHERE title = 'Rave Cannon' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9562 WHERE title = 'Rave*it!! Rave*it!! ' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2258 WHERE title = 'Red. by Full Metal Jacket' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9875 WHERE title = 'Red. by Jack Trance' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1362 WHERE title = 'Reflux' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3848 WHERE title = 'refrain' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3697 WHERE title = 'reunion' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2401 WHERE title = 'Ristaccia' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.942 WHERE title = 'ruin of opals' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9328 WHERE title = 'sakura storm' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3011 WHERE title = 'SAY BAY' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1115 WHERE title = 'Say YEEEAHH' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0239 WHERE title = 'SCREAM SQUAD' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.901 WHERE title = 'Scripted Connection⇒ A mix' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9945 WHERE title = 'Sense 2007' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0743 WHERE title = 'Session 9 -Chronicles-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4973 WHERE title = 'Shooting Fireball' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0825 WHERE title = 'Sigmund' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1981 WHERE title = 'Sky High' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2382 WHERE title = 'Slipstream' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0299 WHERE title = 'Snake Stick' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1091 WHERE title = 'Snakey Kung-fu' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.122 WHERE title = 'Sol Cosine Job 2' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9792 WHERE title = 'SOLID STATE SQUAD' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0449 WHERE title = 'Sounds Of Summer' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0918 WHERE title = 'SpaceLand☆TOYBOX' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1167 WHERE title = 'SPECIAL SUMMER CAMPAIGN!' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1854 WHERE title = 'Steel Edge' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2139 WHERE title = 'StrayedCatz' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0453 WHERE title = 'STULTI' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0738 WHERE title = 'Summerlights(IIDX Edition)' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.155 WHERE title = 'Super Rush' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0439 WHERE title = 'Symmetry' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2537 WHERE title = 'SYNC-ANTHEM' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0778 WHERE title = 'The Chase' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2951 WHERE title = 'THE DAY OF JUBILATIONS' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0991 WHERE title = 'The Least 100sec' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2131 WHERE title = 'The Limbo' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3417 WHERE title = 'The Rebellion of Sequencer' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9743 WHERE title = 'The Sampling Paradise' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3847 WHERE title = 'Thor''s Hammer' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8972 WHERE title = 'Thunderbolt' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0774 WHERE title = 'TIEFSEE' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1684 WHERE title = 'Timepiece phase II' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1365 WHERE title = 'Timepiece phase II (CN Ver.)' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0996 WHERE title = 'Todestrieb' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0504 WHERE title = 'TOGAKUSHI' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1835 WHERE title = 'TOXIC VIBRATION' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1557 WHERE title = 'Triple Counter' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2937 WHERE title = 'Trill auf G' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1004 WHERE title = 'TROOPERS' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2062 WHERE title = 'True Blue' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0868 WHERE title = 'Unbelief' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9312 WHERE title = 'V' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1777 WHERE title = 'Valanga' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8758 WHERE title = 'VANESSA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9685 WHERE title = 'Venom' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1753 WHERE title = 'Verflucht' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2325 WHERE title = 'Visterhv' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.8077 WHERE title = 'voltississimo' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9811 WHERE title = 'VOX RUSH' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4069 WHERE title = 'VOX UP' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1 WHERE title = 'Watch Out Pt.2' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1449 WHERE title = 'We''re so Happy (P*Light Remix) IIDX ver.' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3453 WHERE title = 'WONDER WALKER' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1131 WHERE title = 'X' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3129 WHERE title = 'X-DEN' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2926 WHERE title = 'Xlo' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0672 WHERE title = 'Xperanza' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1507 WHERE title = 'Y&Co. is dead or alive' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2627 WHERE title = 'YAKSHA' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.908 WHERE title = 'Zirkfied' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0687 WHERE title = 'ZZ' AND difficulty = 'ANOTHER';

-- HYPER難易度のcoef値を更新（difficulty: 3 → HYPER）
UPDATE songs SET coef = 0.8859 WHERE title = 'gigadelic' AND difficulty = 'HYPER';
UPDATE songs SET coef = 0.6433 WHERE title = 'Innocent Walls' AND difficulty = 'HYPER';

-- LEGGENDARIA難易度のcoef値を更新（difficulty: 10 → LEGGENDARIA）
UPDATE songs SET coef = 0.9734 WHERE title = 'AIR RAID FROM THA UNDAGROUND' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9791 WHERE title = 'Amazing Mirage' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.2569 WHERE title = 'Ancient Scapes' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.897 WHERE title = 'Beat Radiance' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.1273 WHERE title = 'Blue Rain' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.1975 WHERE title = 'B4U(BEMANI FOR YOU MIX)' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.1483 WHERE title = 'CHRONO DIVER -NORNIR-' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.1391 WHERE title = 'Close the World feat.a☆ru' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9937 WHERE title = 'CONTRACT' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9845 WHERE title = 'Cosmic Cat' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.2477 WHERE title = 'EBONY & IVORY' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.3351 WHERE title = 'Feel The Beat' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.1285 WHERE title = 'GRID KNIGHT' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.097 WHERE title = 'ICARUS' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9851 WHERE title = 'invoker' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.268 WHERE title = 'KAISER PHOENIX' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.1599 WHERE title = 'KAMAITACHI' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0099 WHERE title = 'Kung-fu Empire' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.1607 WHERE title = 'Little Little Princess' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0618 WHERE title = 'QUANTUM TELEPORTATION' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9293 WHERE title = 'RED ZONE' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.2901 WHERE title = 'Sigmund' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9248 WHERE title = 'SOLID STATE SQUAD' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0319 WHERE title = 'spiral galaxy' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.8917 WHERE title = 'STARLIGHT DANCEHALL' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0484 WHERE title = 'THANK YOU FOR PLAYING' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9189 WHERE title = 'THE DEEP STRIKER' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9859 WHERE title = 'Twelfth Style' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0841 WHERE title = 'Ubertreffen' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0307 WHERE title = 'VANESSA' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.3397 WHERE title = 'Verflucht' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9155 WHERE title = 'waxing and wanding' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0318 WHERE title = 'Welcome' AND difficulty = 'LEGGENDARIA';

-- 日本語楽曲のcoef値を更新（difficulty: 4 → ANOTHER）
UPDATE songs SET coef = 0.9359 WHERE title = 'アストライアの双皿' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1049 WHERE title = 'イザナミノナゲキ' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0039 WHERE title = 'カゴノトリ～弐式～' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4091 WHERE title = 'キャトられ恋はモ～モク' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2756 WHERE title = 'シムルグの目醒め' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2138 WHERE title = '〆' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.135 WHERE title = 'シュレーディンガーの猫' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1843 WHERE title = 'それは花火のような恋' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2155 WHERE title = 'たまゆら' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2291 WHERE title = 'トリカゴノ鳳凰' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0101 WHERE title = 'ピアノ協奏曲第１番"蠍火"' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1912 WHERE title = 'めいさいアイドル☆あいむちゃん♪' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1111 WHERE title = 'リリーゼと炎龍レーヴァテイン' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0762 WHERE title = 'ワルツ第17番 ト短調"大犬のワルツ"' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.5066 WHERE title = '駅猫のワルツ' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1939 WHERE title = '火影' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2032 WHERE title = '焔極OVERKILL' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1986 WHERE title = '音楽' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9928 WHERE title = '夏色DIARY - L.E.D.-G STYLE MIX -' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0542 WHERE title = '海神' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1251 WHERE title = '共鳴遊戯の華' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.22 WHERE title = '狂イ咲ケ焔ノ華' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1851 WHERE title = '金野火織の金色提言' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.035 WHERE title = '九尾狐夜行' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.064 WHERE title = '紅牡丹' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2574 WHERE title = '轟け！恋のビーンボール！！' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0459 WHERE title = '黒髪乱れし修羅となりて' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0933 WHERE title = '桜' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2424 WHERE title = '子供の落書き帳' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.178 WHERE title = '紫陽花 -AZISAI-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9898 WHERE title = '疾風迅雷' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0397 WHERE title = '灼熱 Pt.2 Long Train Running' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0111 WHERE title = '灼熱Beach Side Bunny' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1274 WHERE title = '少年A' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3622 WHERE title = '少年は空を辿る' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0721 WHERE title = '真 地獄超特急 -HELL or HELL-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1646 WHERE title = '神謳 -RESONANCE-' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3001 WHERE title = '刃図羅' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1476 WHERE title = '聖人の塔' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9105 WHERE title = '雪月花' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0139 WHERE title = '千年ノ理' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1205 WHERE title = '旋律のドグマ～Miserables～' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0288 WHERE title = '即席！脳直★ミュージックシステム' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2036 WHERE title = '嘆きの樹' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3955 WHERE title = '津軽雪' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.569 WHERE title = '天空の夜明け' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.172 WHERE title = '電人、暁に斃れる。' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3503 WHERE title = '東京神話' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3393 WHERE title = '童話回廊' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2666 WHERE title = '卑弥呼' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.0986 WHERE title = '表裏一体！？怪盗いいんちょの悩み' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.1798 WHERE title = '不沈艦CANDY' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2344 WHERE title = '抱きしめてモナムール' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2735 WHERE title = '冥' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9983 WHERE title = '恋する☆宇宙戦争っ！！' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.2769 WHERE title = '煉獄のエルフェリア' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 0.9075 WHERE title = '最小三倍完全数' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.4273 WHERE title = 'お菓子の王国' AND difficulty = 'ANOTHER';
UPDATE songs SET coef = 1.3683 WHERE title = 'ΕΛΠΙΣ' AND difficulty = 'ANOTHER';

-- 日本語楽曲のcoef値を更新（difficulty: 10 → LEGGENDARIA）
UPDATE songs SET coef = 1.0442 WHERE title = '仮想空間の旅人たち' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.0634 WHERE title = '疾風迅雷' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 1.2819 WHERE title = '超青少年ノ為ノ超多幸ナ超古典的超舞曲' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.986 WHERE title = '廿' AND difficulty = 'LEGGENDARIA';
UPDATE songs SET coef = 0.9676 WHERE title = '龍と少女とデコヒーレンス' AND difficulty = 'LEGGENDARIA';

-- 更新されたレコード数を確認
SELECT COUNT(*) as updated_count FROM songs WHERE coef IS NOT NULL; 