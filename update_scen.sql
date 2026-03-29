-- Add scen_id column to scenarios table
ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS scen_id text;
CREATE INDEX IF NOT EXISTS scenarios_scen_id_idx ON public.scenarios(scen_id);

-- ============================================================
-- BFP6: Mannerheim Cross
-- ============================================================
UPDATE public.scenarios SET scen_id = 'BFP 150' WHERE title = 'Grenades, Knives, and Fists';
UPDATE public.scenarios SET scen_id = 'BFP 151' WHERE title = 'Delaying Action at Krylänmäki';
UPDATE public.scenarios SET scen_id = 'BFP 152' WHERE title = 'No Vacancy';
UPDATE public.scenarios SET scen_id = 'BFP 153' WHERE title = 'Tolvajarvi Tussle';
UPDATE public.scenarios SET scen_id = 'BFP 154' WHERE title = 'Little Tin Can Opener';
UPDATE public.scenarios SET scen_id = 'BFP 155' WHERE title = 'Leningrad Reds';
UPDATE public.scenarios SET scen_id = 'BFP 156' WHERE title = 'Attacking the Giant';
UPDATE public.scenarios SET scen_id = 'BFP 157' WHERE title = 'Gateway to Viipuri';
UPDATE public.scenarios SET scen_id = 'BFP 158' WHERE title = 'Mutka Strikes Again';
UPDATE public.scenarios SET scen_id = 'BFP 159' WHERE title = 'Machine Gun Alley';
UPDATE public.scenarios SET scen_id = 'BFP 160' WHERE title = 'Karelian Sculptors';
UPDATE public.scenarios SET scen_id = 'BFP 161' WHERE title = 'Red Ice';
UPDATE public.scenarios SET scen_id = 'BFP 162' WHERE title = 'Hand Delivered Sausage';
UPDATE public.scenarios SET scen_id = 'BFP 163' WHERE title = 'Million Dollar Bash';
UPDATE public.scenarios SET scen_id = 'BFP 164' WHERE title = 'Fire and Brimstone';
UPDATE public.scenarios SET scen_id = 'BFP 165' WHERE title = 'Summajarvi 5 (Sj5)';
UPDATE public.scenarios SET scen_id = 'BFP 166' WHERE title = 'Haunted Zoo';
UPDATE public.scenarios SET scen_id = 'BFP 167' WHERE title = 'Muolaa 1';
UPDATE public.scenarios SET scen_id = 'BFP 168' WHERE title = 'Leningrad Monsters';
UPDATE public.scenarios SET scen_id = 'BFP 169' WHERE title = 'Last Minute Heroics';
UPDATE public.scenarios SET scen_id = 'BFP 170' WHERE title = 'The Tyrant''s Block';
UPDATE public.scenarios SET scen_id = 'BFP 171' WHERE title = 'Teaching Superman';
UPDATE public.scenarios SET scen_id = 'BFP 172' WHERE title = 'Beauty Ruined';
UPDATE public.scenarios SET scen_id = 'BFP 173' WHERE title = 'Kalevela Beckons';
UPDATE public.scenarios SET scen_id = 'BFP 174' WHERE title = 'Castle of Onega';
UPDATE public.scenarios SET scen_id = 'BFP 175' WHERE title = 'Hostage to Fortune';
UPDATE public.scenarios SET scen_id = 'BFP 176' WHERE title = 'Hell Frozen Over';
UPDATE public.scenarios SET scen_id = 'BFP 177' WHERE title = 'The 11th Man';
UPDATE public.scenarios SET scen_id = 'BFP 178' WHERE title = 'Karelian Inferno';
UPDATE public.scenarios SET scen_id = 'BFP 179' WHERE title = 'Call Them Bazookas';
UPDATE public.scenarios SET scen_id = 'BFP 180' WHERE title = 'Stig''s Stugs';
UPDATE public.scenarios SET scen_id = 'BFP 181' WHERE title = 'Under the Bloody Birches';
UPDATE public.scenarios SET scen_id = 'BFP 182' WHERE title = 'The Anzio of East Karelia';
UPDATE public.scenarios SET scen_id = 'BFP 183' WHERE title = 'Bad Blood';
UPDATE public.scenarios SET scen_id = 'BFP 184' WHERE title = 'Blick''s Balk';
UPDATE public.scenarios SET scen_id = 'BFP 185' WHERE title = 'Talinmylly Motti';
UPDATE public.scenarios SET scen_id = 'BFP 186' WHERE title = 'Tali Whacker';
UPDATE public.scenarios SET scen_id = 'BFP 187' WHERE title = 'Bloody Road to Ihantala';
UPDATE public.scenarios SET scen_id = 'BFP 188' WHERE title = 'Inferno at Ihantala';
UPDATE public.scenarios SET scen_id = 'BFP 189' WHERE title = 'Blood on the Shores';
UPDATE public.scenarios SET scen_id = 'BFP 190' WHERE title = 'Vuoski Melee';
UPDATE public.scenarios SET scen_id = 'BFP 191' WHERE title = 'Brotell: The Finnish Ace';
UPDATE public.scenarios SET scen_id = 'BFP 192' WHERE title = 'The Last Motti';
UPDATE public.scenarios SET scen_id = 'BFP 193' WHERE title = 'Lapland Armor';

-- ============================================================
-- BFP5: Poland in Flames
-- ============================================================
UPDATE public.scenarios SET scen_id = 'BFP 105' WHERE title = 'The Winter City';
UPDATE public.scenarios SET scen_id = 'BFP 106' WHERE title = 'Going Postal';
UPDATE public.scenarios SET scen_id = 'BFP 107' WHERE title = 'Costly Baptism';
UPDATE public.scenarios SET scen_id = 'BFP 108' WHERE title = 'Ceramic City';
UPDATE public.scenarios SET scen_id = 'BFP 109' WHERE title = 'Training Day';
UPDATE public.scenarios SET scen_id = 'BFP 110' WHERE title = 'Polish Panzerjaegers';
UPDATE public.scenarios SET scen_id = 'BFP 111' WHERE title = 'Before the Blunder';
UPDATE public.scenarios SET scen_id = 'BFP 112' WHERE title = 'Killer Carp';
UPDATE public.scenarios SET scen_id = 'BFP 113' WHERE title = 'Bunker Bash';
UPDATE public.scenarios SET scen_id = 'BFP 114' WHERE title = 'Engineering Defeat';
UPDATE public.scenarios SET scen_id = 'BFP 115' WHERE title = 'Turned Back at Tylicz';
UPDATE public.scenarios SET scen_id = 'BFP 116' WHERE title = 'Stop, Turn, Fight!';
UPDATE public.scenarios SET scen_id = 'BFP 117' WHERE title = 'Silent Bayonets';
UPDATE public.scenarios SET scen_id = 'BFP 118' WHERE title = 'Kazina Klash';
UPDATE public.scenarios SET scen_id = 'BFP 119' WHERE title = 'Real Steel';
UPDATE public.scenarios SET scen_id = 'BFP 120' WHERE title = 'Defiant Resistance';
UPDATE public.scenarios SET scen_id = 'BFP 121' WHERE title = 'Old Friends';
UPDATE public.scenarios SET scen_id = 'BFP 122' WHERE title = 'At Sword Point';
UPDATE public.scenarios SET scen_id = 'BFP 123' WHERE title = 'Asphalt Soldiers';
UPDATE public.scenarios SET scen_id = 'BFP 124' WHERE title = 'The Tanks of Warsaw';
UPDATE public.scenarios SET scen_id = 'BFP 125' WHERE title = 'A Wave Breaking with the Tide';
UPDATE public.scenarios SET scen_id = 'BFP 126' WHERE title = 'Give em Some Flak';
UPDATE public.scenarios SET scen_id = 'BFP 127' WHERE title = 'The Road to Warsaw';
UPDATE public.scenarios SET scen_id = 'BFP 128' WHERE title = 'The Devil''s Armpit';
UPDATE public.scenarios SET scen_id = 'BFP 129' WHERE title = 'A Bitter Day';
UPDATE public.scenarios SET scen_id = 'BFP 130' WHERE title = 'The Spearhead';
UPDATE public.scenarios SET scen_id = 'BFP 131' WHERE title = 'Zboiska Heights';
UPDATE public.scenarios SET scen_id = 'BFP 132' WHERE title = 'Steel Garden';
UPDATE public.scenarios SET scen_id = 'BFP 133' WHERE title = 'Over the Hills';
UPDATE public.scenarios SET scen_id = 'BFP 134' WHERE title = 'Hell at Kiernozia';
UPDATE public.scenarios SET scen_id = 'BFP 135' WHERE title = 'No Shortage of Determination';
UPDATE public.scenarios SET scen_id = 'BFP 136' WHERE title = 'Boiling Kettle of Fire and Blood';
UPDATE public.scenarios SET scen_id = 'BFP 137' WHERE title = 'Death Throes';
UPDATE public.scenarios SET scen_id = 'BFP 138' WHERE title = 'Outgunned';
UPDATE public.scenarios SET scen_id = 'BFP 139' WHERE title = 'Cockroaches Against Panzers';
UPDATE public.scenarios SET scen_id = 'BFP 140' WHERE title = 'Iron Greeting';
UPDATE public.scenarios SET scen_id = 'BFP 141' WHERE title = 'Belorussian Brawl';
UPDATE public.scenarios SET scen_id = 'BFP 142' WHERE title = 'The New Eagles';
UPDATE public.scenarios SET scen_id = 'BFP 143' WHERE title = 'Gun Show';
UPDATE public.scenarios SET scen_id = 'BFP 144' WHERE title = 'Forest of Death';
UPDATE public.scenarios SET scen_id = 'BFP 145' WHERE title = 'Rock and a Hard Place';
UPDATE public.scenarios SET scen_id = 'BFP 146' WHERE title = 'Szacked';
UPDATE public.scenarios SET scen_id = 'BFP 147' WHERE title = 'The Commissar''s Folly';
UPDATE public.scenarios SET scen_id = 'BFP 148' WHERE title = 'Backs Against the Wall';
UPDATE public.scenarios SET scen_id = 'BFP 149' WHERE title = 'Kock Strong';

-- ============================================================
-- BFP4: Crucible of Steel
-- ============================================================
UPDATE public.scenarios SET scen_id = 'BFP 73'  WHERE title = 'Preliminary Move';
UPDATE public.scenarios SET scen_id = 'BFP 74'  WHERE title = 'Coiled to Strike';
UPDATE public.scenarios SET scen_id = 'BFP 75'  WHERE title = 'Schreiber''s Success';
UPDATE public.scenarios SET scen_id = 'BFP 76'  WHERE title = 'Trial of the Infantry';
UPDATE public.scenarios SET scen_id = 'BFP 77'  WHERE title = 'Burning Down the House';
UPDATE public.scenarios SET scen_id = 'BFP 78'  WHERE title = 'Operation Wheatfield';
UPDATE public.scenarios SET scen_id = 'BFP 79'  WHERE title = 'A Hard Push';
UPDATE public.scenarios SET scen_id = 'BFP 80'  WHERE title = 'Ratushniak''s Sacrifice';
UPDATE public.scenarios SET scen_id = 'BFP 81'  WHERE title = 'Iron Coffins';
UPDATE public.scenarios SET scen_id = 'BFP 82'  WHERE title = 'Steamroller';
UPDATE public.scenarios SET scen_id = 'BFP 83'  WHERE title = 'The Second Belt';
UPDATE public.scenarios SET scen_id = 'BFP 84'  WHERE title = 'Kreida Station';
UPDATE public.scenarios SET scen_id = 'BFP 85'  WHERE title = 'Churchills at Kursk';
UPDATE public.scenarios SET scen_id = 'BFP 86'  WHERE title = 'Panzer Regiment Rothenburg';
UPDATE public.scenarios SET scen_id = 'BFP 87'  WHERE title = 'Fork in the Road';
UPDATE public.scenarios SET scen_id = 'BFP 88'  WHERE title = 'The Bunkered Village';
UPDATE public.scenarios SET scen_id = 'BFP 89'  WHERE title = 'Relentless Pressure';
UPDATE public.scenarios SET scen_id = 'BFP 90'  WHERE title = 'Early Morning Action';
UPDATE public.scenarios SET scen_id = 'BFP 91'  WHERE title = 'Death Roamed Freely';
UPDATE public.scenarios SET scen_id = 'BFP 92'  WHERE title = 'Trenches in Flames';
UPDATE public.scenarios SET scen_id = 'BFP 93'  WHERE title = 'Klein Stalingrad';
UPDATE public.scenarios SET scen_id = 'BFP 94'  WHERE title = 'To the Last Shell';
UPDATE public.scenarios SET scen_id = 'BFP 95'  WHERE title = 'Obian Highway';
UPDATE public.scenarios SET scen_id = 'BFP 96'  WHERE title = 'Hotly Contested Town';
UPDATE public.scenarios SET scen_id = 'BFP 97'  WHERE title = 'Renewed Pressure';
UPDATE public.scenarios SET scen_id = 'BFP 98'  WHERE title = 'Place of Honor';
UPDATE public.scenarios SET scen_id = 'BFP 99'  WHERE title = 'Ivanovskii';
UPDATE public.scenarios SET scen_id = 'BFP 100' WHERE title = 'Tiger Vanguard';
UPDATE public.scenarios SET scen_id = 'BFP 101' WHERE title = 'Panzer Spirit';
UPDATE public.scenarios SET scen_id = 'BFP 102' WHERE title = 'Tolstoy Woods';
UPDATE public.scenarios SET scen_id = 'BFP 103' WHERE title = 'Knife in the Flank';
UPDATE public.scenarios SET scen_id = 'BFP 104' WHERE title = 'Flying Turrets';

-- ============================================================
-- BFP3: Blood and Jungle
-- ============================================================
UPDATE public.scenarios SET scen_id = 'BFP 26'  WHERE title = 'Armored Samurai';
UPDATE public.scenarios SET scen_id = 'BFP 27'  WHERE title = 'Chapei Chockblock';
UPDATE public.scenarios SET scen_id = 'BFP 28'  WHERE title = 'Marco Polo Bridge';
UPDATE public.scenarios SET scen_id = 'BFP 29'  WHERE title = 'Hueishan Docks';
UPDATE public.scenarios SET scen_id = 'BFP 30'  WHERE title = 'Melee Near the Coast';
UPDATE public.scenarios SET scen_id = 'BFP 31'  WHERE title = 'Chinese Alamo';
UPDATE public.scenarios SET scen_id = 'BFP 32'  WHERE title = 'Slaughter at Nanyaun';
UPDATE public.scenarios SET scen_id = 'BFP 33'  WHERE title = 'Kunlunguan';
UPDATE public.scenarios SET scen_id = 'BFP 34'  WHERE title = 'Hundred Regiments Offensive';
UPDATE public.scenarios SET scen_id = 'BFP 35'  WHERE title = 'Mai Phu';
UPDATE public.scenarios SET scen_id = 'BFP 36'  WHERE title = 'Wannan Incident';
UPDATE public.scenarios SET scen_id = 'BFP 37'  WHERE title = 'Debacle at Yeang Dang';
UPDATE public.scenarios SET scen_id = 'BFP 38'  WHERE title = 'Sugar Cane Shuffle';
UPDATE public.scenarios SET scen_id = 'BFP 39'  WHERE title = 'Langoan Airfield';
UPDATE public.scenarios SET scen_id = 'BFP 40'  WHERE title = 'Advance to Kakas';
UPDATE public.scenarios SET scen_id = 'BFP 41'  WHERE title = 'Last Cavalry Charge';
UPDATE public.scenarios SET scen_id = 'BFP 42'  WHERE title = 'Bukit Full of Trouble';
UPDATE public.scenarios SET scen_id = 'BFP 43'  WHERE title = 'Aerodrome P1';
UPDATE public.scenarios SET scen_id = 'BFP 44'  WHERE title = 'Claws of the Sparrow';
UPDATE public.scenarios SET scen_id = 'BFP 45'  WHERE title = 'BIA''s First Battle';
UPDATE public.scenarios SET scen_id = 'BFP 46'  WHERE title = 'The Shan Capital';
UPDATE public.scenarios SET scen_id = 'BFP 47'  WHERE title = 'Seizing Viru Harbor';
UPDATE public.scenarios SET scen_id = 'BFP 48'  WHERE title = 'Ninth Tanks';
UPDATE public.scenarios SET scen_id = 'BFP 49'  WHERE title = 'Just a Drive Along the Beach';
UPDATE public.scenarios SET scen_id = 'BFP 50'  WHERE title = 'Alligator Tanks';
UPDATE public.scenarios SET scen_id = 'BFP51'   WHERE title = 'Kwajalein Crush';
UPDATE public.scenarios SET scen_id = 'BFP 52'  WHERE title = 'Kachin Rangers';
UPDATE public.scenarios SET scen_id = 'BFP 53'  WHERE title = 'Grant vs. Stuart';
UPDATE public.scenarios SET scen_id = 'BFP 54'  WHERE title = 'Shenam Pass';
UPDATE public.scenarios SET scen_id = 'BFP 55'  WHERE title = 'Used and Abused';
UPDATE public.scenarios SET scen_id = 'BFP 56'  WHERE title = 'White Beach 1';
UPDATE public.scenarios SET scen_id = 'BFP 57'  WHERE title = 'Last Drop';
UPDATE public.scenarios SET scen_id = 'BFP 58'  WHERE title = 'San Manuel Melee';
UPDATE public.scenarios SET scen_id = 'BFP 59'  WHERE title = 'Geki Cacti';
UPDATE public.scenarios SET scen_id = 'BFP 60'  WHERE title = 'Thrilla in Manila';
UPDATE public.scenarios SET scen_id = 'BFP 61'  WHERE title = 'Flaming Arseholes';
UPDATE public.scenarios SET scen_id = 'BFP 62'  WHERE title = 'Curly and the Brigadier';
UPDATE public.scenarios SET scen_id = 'BFP 63'  WHERE title = 'Typhoon of Steel';
UPDATE public.scenarios SET scen_id = 'BFP 64'  WHERE title = 'Fighting With the Devil';
UPDATE public.scenarios SET scen_id = 'BFP 65'  WHERE title = 'Frogs in the Pocket';
UPDATE public.scenarios SET scen_id = 'BFP 66'  WHERE title = 'Signal Hill';
UPDATE public.scenarios SET scen_id = 'BFP 67'  WHERE title = 'Coke Hill';
UPDATE public.scenarios SET scen_id = 'BFP 68'  WHERE title = 'First Day at Fuchin';
UPDATE public.scenarios SET scen_id = 'BFP 69'  WHERE title = 'Fuchin Fortified';
UPDATE public.scenarios SET scen_id = 'BFP 70'  WHERE title = 'Emperor of Shozu Hill';
UPDATE public.scenarios SET scen_id = 'BFP 71'  WHERE title = 'Surabaya Slugfest';
UPDATE public.scenarios SET scen_id = 'BFP 72'  WHERE title = 'Police Action';

-- ============================================================
-- OtO: Onslaught to Orsha
-- ============================================================
UPDATE public.scenarios SET scen_id = 'OtO 1'  WHERE title = 'Down in a Hole';
UPDATE public.scenarios SET scen_id = 'OtO 2'  WHERE title = 'Hornet''s Nest';
UPDATE public.scenarios SET scen_id = 'OtO 3'  WHERE title = 'Shumilino';
UPDATE public.scenarios SET scen_id = 'OtO 4'  WHERE title = 'Funnel of Death';
UPDATE public.scenarios SET scen_id = 'OtO 5'  WHERE title = 'Bunker Burning';
UPDATE public.scenarios SET scen_id = 'OtO 6'  WHERE title = 'Fire from the Hole';
UPDATE public.scenarios SET scen_id = 'OtO 7'  WHERE title = 'The Orsha Plain';
UPDATE public.scenarios SET scen_id = 'OtO 8'  WHERE title = 'Another Bloody Morning';
UPDATE public.scenarios SET scen_id = 'OtO 9'  WHERE title = 'Sparkplug';
UPDATE public.scenarios SET scen_id = 'OtO 10' WHERE title = 'Falling Like Dominoes';
UPDATE public.scenarios SET scen_id = 'OtO 11' WHERE title = 'Tooth and Nail';
UPDATE public.scenarios SET scen_id = 'OtO 12' WHERE title = 'Close Quarters';
UPDATE public.scenarios SET scen_id = 'OtO 13' WHERE title = 'Motoring to Mogilev';
UPDATE public.scenarios SET scen_id = 'OtO 14' WHERE title = 'Hornet Swarm';
UPDATE public.scenarios SET scen_id = 'OtO 15' WHERE title = 'Western Dvina Duel';
UPDATE public.scenarios SET scen_id = 'OtO 16' WHERE title = 'Tangle at Tolochin';
UPDATE public.scenarios SET scen_id = 'OtO 17' WHERE title = 'Down in Flames';
UPDATE public.scenarios SET scen_id = 'OtO 18' WHERE title = 'Hoffmeister''s Charge';
UPDATE public.scenarios SET scen_id = 'OtO 19' WHERE title = 'Where''s the Beef';
UPDATE public.scenarios SET scen_id = 'OtO 20' WHERE title = 'Bloody Bobruisk';
UPDATE public.scenarios SET scen_id = 'OtO 21' WHERE title = 'Oriola Force';
UPDATE public.scenarios SET scen_id = 'OtO 22' WHERE title = 'Lapitschi Fit';
UPDATE public.scenarios SET scen_id = 'OtO 23' WHERE title = 'Inferno at Krupki';
UPDATE public.scenarios SET scen_id = 'OtO 24' WHERE title = 'Cooked Hamman';
UPDATE public.scenarios SET scen_id = 'OtO 25' WHERE title = 'Shootout at Slutsk';
UPDATE public.scenarios SET scen_id = 'OtO 26' WHERE title = 'Bridgehead on the Berezina';
UPDATE public.scenarios SET scen_id = 'OtO 27' WHERE title = 'Clash at the Berezina';
UPDATE public.scenarios SET scen_id = 'OtO 28' WHERE title = 'Desperate Bridgehead';
UPDATE public.scenarios SET scen_id = 'OtO 29' WHERE title = 'The Cat''s Lair';
UPDATE public.scenarios SET scen_id = 'OtO 30' WHERE title = 'The Big Cat''s Lair';
UPDATE public.scenarios SET scen_id = 'OtO 31' WHERE title = 'Schmidt''s Roadblock';
UPDATE public.scenarios SET scen_id = 'OtO 32' WHERE title = 'Berated at Baronovichi';

-- ============================================================
-- ITR2: Into the Rubble 2
-- ============================================================
UPDATE public.scenarios SET scen_id = 'ITR 1'  WHERE title = 'Debacle at Sung Kiang';
UPDATE public.scenarios SET scen_id = 'ITR 2'  WHERE title = 'Factory in Flix';
UPDATE public.scenarios SET scen_id = 'ITR 3'  WHERE title = 'Tough as Nails';
UPDATE public.scenarios SET scen_id = 'ITR 4'  WHERE title = 'Clash at Ponyri';
UPDATE public.scenarios SET scen_id = 'ITR 5'  WHERE title = 'Fire Teams';
UPDATE public.scenarios SET scen_id = 'ITR 6'  WHERE title = 'The Ceramic Factory';
UPDATE public.scenarios SET scen_id = 'ITR 7'  WHERE title = 'Rebounded Spirit';
UPDATE public.scenarios SET scen_id = 'ITR 8'  WHERE title = 'Beyond the Slaughterhouse';
UPDATE public.scenarios SET scen_id = 'ITR 9'  WHERE title = 'Asia''s Stalingrad';
UPDATE public.scenarios SET scen_id = 'ITR 10' WHERE title = 'Samurai Stalingrad';
UPDATE public.scenarios SET scen_id = 'ITR 11' WHERE title = 'Cremation Station';
UPDATE public.scenarios SET scen_id = 'ITR 12' WHERE title = 'Sosabowski Slapdown';
UPDATE public.scenarios SET scen_id = 'ITR 13' WHERE title = 'To the Last Bullet';
UPDATE public.scenarios SET scen_id = 'ITR 14' WHERE title = 'Between Rockets and a Hard Place';
UPDATE public.scenarios SET scen_id = 'ITR 15' WHERE title = 'Tractor Factory 137';
UPDATE public.scenarios SET scen_id = 'ITR 16' WHERE title = 'The Fighting Tankbusters';
UPDATE public.scenarios SET scen_id = 'ITR 17' WHERE title = 'The Devil''s Factory';
UPDATE public.scenarios SET scen_id = 'ITR 18' WHERE title = 'Capital of the Ruins';
UPDATE public.scenarios SET scen_id = 'ITR 19' WHERE title = 'The Narrow Front';
UPDATE public.scenarios SET scen_id = 'ITR 20' WHERE title = 'Fill ''Er Up, Mac?';

-- ============================================================
-- OS: Objective: Schmidt
-- ============================================================
UPDATE public.scenarios SET scen_id = 'OS 1'  WHERE title = 'Conscript Counter';
UPDATE public.scenarios SET scen_id = 'OS 2'  WHERE title = 'The Wolf''s Howl';
UPDATE public.scenarios SET scen_id = 'OS 3'  WHERE title = 'Schindler''s Limp';
UPDATE public.scenarios SET scen_id = 'OS 4'  WHERE title = 'Bad Onnen';
UPDATE public.scenarios SET scen_id = 'OS 5'  WHERE title = 'Disaster at Schmidt';
UPDATE public.scenarios SET scen_id = 'OS 6'  WHERE title = 'General Fleig';
UPDATE public.scenarios SET scen_id = 'OS 7'  WHERE title = 'Devil''s Sunday';
UPDATE public.scenarios SET scen_id = 'OS 8'  WHERE title = 'Toehold';
UPDATE public.scenarios SET scen_id = 'OS 9'  WHERE title = 'Walk the Walk';
UPDATE public.scenarios SET scen_id = 'OS 10' WHERE title = 'Greyhounds!';
UPDATE public.scenarios SET scen_id = 'OS 11' WHERE title = 'Kickoff In Huertgen';
UPDATE public.scenarios SET scen_id = 'OS 12' WHERE title = 'Roll On!';
UPDATE public.scenarios SET scen_id = 'OS 13' WHERE title = 'The Route';
UPDATE public.scenarios SET scen_id = 'OS 14' WHERE title = 'Drive ''Em Out';
UPDATE public.scenarios SET scen_id = 'OS 15' WHERE title = 'Nightlife Is For The Junge';
UPDATE public.scenarios SET scen_id = 'OS 16' WHERE title = 'Sappers as Infantry';
UPDATE public.scenarios SET scen_id = 'OS 17' WHERE title = 'The Worst Place Of Any';

-- ============================================================
-- BD: Bitterest Day
-- ============================================================
UPDATE public.scenarios SET scen_id = 'BD 1' WHERE title = 'Opening Probe';
UPDATE public.scenarios SET scen_id = 'BD 2' WHERE title = 'Limited Gains';
UPDATE public.scenarios SET scen_id = 'BD 3' WHERE title = 'Western Anchor';
UPDATE public.scenarios SET scen_id = 'BD 4' WHERE title = 'Thicker Than Flies';
UPDATE public.scenarios SET scen_id = 'BD 5' WHERE title = 'Ultimate Insult';
UPDATE public.scenarios SET scen_id = 'BD 6' WHERE title = 'Bitterest Day';
UPDATE public.scenarios SET scen_id = 'BD 7' WHERE title = 'Crescent Carnage';
UPDATE public.scenarios SET scen_id = 'BD 8' WHERE title = '"We''re Dead Anyway"';
UPDATE public.scenarios SET scen_id = 'BD 9' WHERE title = 'Good Luck Charm';

-- ============================================================
-- BFP2: Operation Cobra
-- ============================================================
UPDATE public.scenarios SET scen_id = 'BFP 14' WHERE title = 'Opening Phase';
UPDATE public.scenarios SET scen_id = 'BFP 15' WHERE title = 'Cobra''s Venom';
UPDATE public.scenarios SET scen_id = 'BFP 16' WHERE title = 'Snake Charmed';
UPDATE public.scenarios SET scen_id = 'BFP 17' WHERE title = 'Seize That Crossroad';
UPDATE public.scenarios SET scen_id = 'BFP 18' WHERE title = 'Necklace of Pearls';
UPDATE public.scenarios SET scen_id = 'BFP 19' WHERE title = 'Russian Style';
UPDATE public.scenarios SET scen_id = 'BFP 20' WHERE title = 'Bypassed Lehr';
UPDATE public.scenarios SET scen_id = 'BFP 21' WHERE title = 'Ripe for the Picking';
UPDATE public.scenarios SET scen_id = 'BFP 22' WHERE title = 'Speed Over Caution';
UPDATE public.scenarios SET scen_id = 'BFP 23' WHERE title = 'Prelim to Death Night';
UPDATE public.scenarios SET scen_id = 'BFP 24' WHERE title = 'Death Ride of Das Reich';
UPDATE public.scenarios SET scen_id = 'BFP 25' WHERE title = 'From Villebaudon to Valhalla';

-- ============================================================
-- BtB2: Beyond the Beachhead 2
-- ============================================================
UPDATE public.scenarios SET scen_id = 'BtB 1'  WHERE title = 'Taking Tailleville';
UPDATE public.scenarios SET scen_id = 'BtB 2'  WHERE title = 'Merely Hanging On';
UPDATE public.scenarios SET scen_id = 'BtB 3'  WHERE title = 'Kraut Corner';
UPDATE public.scenarios SET scen_id = 'BtB 4'  WHERE title = 'Firestorm in St. Manvieu';
UPDATE public.scenarios SET scen_id = 'BtB 5'  WHERE title = 'Martinville Ridge';
UPDATE public.scenarios SET scen_id = 'BtB 6'  WHERE title = 'Men Against Tanks';
UPDATE public.scenarios SET scen_id = 'BtB 7'  WHERE title = 'Blood on Hill 192';
UPDATE public.scenarios SET scen_id = 'BtB 8'  WHERE title = 'Steel Inferno';
UPDATE public.scenarios SET scen_id = 'BtB 9'  WHERE title = 'Norman "D"';
UPDATE public.scenarios SET scen_id = 'BtB 10' WHERE title = 'Unplanned Attack';
UPDATE public.scenarios SET scen_id = 'BtB 11' WHERE title = 'Bosq Barbeque';
UPDATE public.scenarios SET scen_id = 'BtB 12' WHERE title = 'Going against the Grain';
UPDATE public.scenarios SET scen_id = 'BtB 13' WHERE title = 'By Chance';
UPDATE public.scenarios SET scen_id = 'BtB 14' WHERE title = 'Swatting a Hornet';
UPDATE public.scenarios SET scen_id = 'BtB 15' WHERE title = 'Becker''s Battery';
UPDATE public.scenarios SET scen_id = 'BtB 16' WHERE title = 'Battlegroup Nor-mons';

-- ============================================================
-- CtR: Corregidor: the Rock
-- Note: 3 titles in source data contain HTML <br/> tags.
--       Two variants are provided for each; one will match.
-- ============================================================
UPDATE public.scenarios SET scen_id = 'CtR 1'  WHERE title = 'Assault At Monkey Point<br/>(May 1942)';
UPDATE public.scenarios SET scen_id = 'CtR 1'  WHERE title = 'Assault At Monkey Point' AND scen_id IS NULL;
UPDATE public.scenarios SET scen_id = 'CtR 2'  WHERE title = 'The Japanese Are In Denver!<br/>(May 1942)';
UPDATE public.scenarios SET scen_id = 'CtR 2'  WHERE title = 'The Japanese Are In Denver!' AND scen_id IS NULL;
UPDATE public.scenarios SET scen_id = 'CtR 3'  WHERE title = 'With Profound Regret<br/>(May 1942)';
UPDATE public.scenarios SET scen_id = 'CtR 3'  WHERE title = 'With Profound Regret' AND scen_id IS NULL;
UPDATE public.scenarios SET scen_id = 'CtR 4'  WHERE title = 'Return To The Rock';
UPDATE public.scenarios SET scen_id = 'CtR 5'  WHERE title = 'Loss Of Command';
UPDATE public.scenarios SET scen_id = 'CtR 6'  WHERE title = 'Black And Blue Swarms';
UPDATE public.scenarios SET scen_id = 'CtR 7'  WHERE title = 'Desperate Hours';
UPDATE public.scenarios SET scen_id = 'CtR 8'  WHERE title = 'A Deadly Tide';
UPDATE public.scenarios SET scen_id = 'CtR 9'  WHERE title = 'Black Beach Slaughter';
UPDATE public.scenarios SET scen_id = 'CtR 10' WHERE title = 'Par For The Course';
UPDATE public.scenarios SET scen_id = 'CtR 11' WHERE title = 'Fire In The Hole';
UPDATE public.scenarios SET scen_id = 'CtR 12' WHERE title = 'Bloodied At Wheeler';
UPDATE public.scenarios SET scen_id = 'CtR 13' WHERE title = 'The Infernal Machine';
UPDATE public.scenarios SET scen_id = 'CtR 14' WHERE title = 'Dangerous Descent Into Maggot Valley';
UPDATE public.scenarios SET scen_id = 'CtR 15' WHERE title = 'Night Of The Living Dead';
UPDATE public.scenarios SET scen_id = 'CtR 16' WHERE title = 'Too Close For Comfort';
UPDATE public.scenarios SET scen_id = 'CtR 17' WHERE title = 'Clearing The Badlands';
UPDATE public.scenarios SET scen_id = 'CtR 18' WHERE title = 'Disaster Near Infantry Point';
UPDATE public.scenarios SET scen_id = 'CtR 19' WHERE title = 'Pug-Nacious';
UPDATE public.scenarios SET scen_id = 'CtR 20' WHERE title = 'Prequel To Armageddon';
UPDATE public.scenarios SET scen_id = 'CtR 21' WHERE title = 'The Gates Of Hell';

-- ============================================================
-- HG2: High Ground 2
-- ============================================================
UPDATE public.scenarios SET scen_id = 'HG 1'  WHERE title = 'Corniche Game';
UPDATE public.scenarios SET scen_id = 'HG 2'  WHERE title = 'Konitsa Crackdown';
UPDATE public.scenarios SET scen_id = 'HG 3'  WHERE title = 'Cohort and the Phalanx';
UPDATE public.scenarios SET scen_id = 'HG 4'  WHERE title = 'Mount Istibei';
UPDATE public.scenarios SET scen_id = 'HG 5'  WHERE title = 'Tanks Take Rook';
UPDATE public.scenarios SET scen_id = 'HG 6'  WHERE title = 'Damned at Demyansk';
UPDATE public.scenarios SET scen_id = 'HG 7'  WHERE title = 'Bonny Nouvelle';
UPDATE public.scenarios SET scen_id = 'HG 8'  WHERE title = 'Peruns Thunder';
UPDATE public.scenarios SET scen_id = 'HG 9'  WHERE title = 'The Gifu';
UPDATE public.scenarios SET scen_id = 'HG 10' WHERE title = 'Stampede at Hill 253';
UPDATE public.scenarios SET scen_id = 'HG 11' WHERE title = 'Skill in Khiliki';
UPDATE public.scenarios SET scen_id = 'HG 12' WHERE title = 'Bumps Along Tiddam Rd.';
UPDATE public.scenarios SET scen_id = 'HG 13' WHERE title = 'Tigers on the Hill';
UPDATE public.scenarios SET scen_id = 'HG 14' WHERE title = 'An Unfriendly Welcome';
UPDATE public.scenarios SET scen_id = 'HG 15' WHERE title = 'King Darges';
UPDATE public.scenarios SET scen_id = 'HG 16' WHERE title = 'Blood Brothers';

-- ============================================================
-- ON: Operation Neptune
-- ============================================================
UPDATE public.scenarios SET scen_id = 'ON 1'  WHERE title = 'Freedom!';
UPDATE public.scenarios SET scen_id = 'ON 2'  WHERE title = 'Wet Feet';
UPDATE public.scenarios SET scen_id = 'ON 3'  WHERE title = 'Stuck Ducks';
UPDATE public.scenarios SET scen_id = 'ON 4'  WHERE title = 'Valiant Sacrifice';
UPDATE public.scenarios SET scen_id = 'ON 5'  WHERE title = 'Sweeping East';
UPDATE public.scenarios SET scen_id = 'ON 6'  WHERE title = 'Sweeping West';
UPDATE public.scenarios SET scen_id = 'ON 7'  WHERE title = 'Sweeping North';
UPDATE public.scenarios SET scen_id = 'ON 8'  WHERE title = 'A Blow Too Late';
UPDATE public.scenarios SET scen_id = 'ON 9'  WHERE title = 'An Unexpected Complication';
UPDATE public.scenarios SET scen_id = 'ON 10' WHERE title = 'Chateau of Death';

-- ============================================================
-- HoW: Hell on Wheels
-- ============================================================
UPDATE public.scenarios SET scen_id = 'HoW 1'  WHERE title = 'Guns of Naro';
UPDATE public.scenarios SET scen_id = 'HoW 2'  WHERE title = 'Canicatti';
UPDATE public.scenarios SET scen_id = 'HoW 3'  WHERE title = 'Redlegs as Infantry';
UPDATE public.scenarios SET scen_id = 'HoW 4'  WHERE title = 'Inch by Inch';
UPDATE public.scenarios SET scen_id = 'HoW 5'  WHERE title = 'Narrow Front';
UPDATE public.scenarios SET scen_id = 'HoW 6'  WHERE title = 'From Bad to Wuerselen';
UPDATE public.scenarios SET scen_id = 'HoW 7'  WHERE title = 'Trench Warfare';
UPDATE public.scenarios SET scen_id = 'HoW 8'  WHERE title = 'Merzenhausen Zoo';
UPDATE public.scenarios SET scen_id = 'HoW 9'  WHERE title = 'A Perfect Match';
UPDATE public.scenarios SET scen_id = 'HoW 10' WHERE title = 'In the Bag';
UPDATE public.scenarios SET scen_id = 'HoW 11' WHERE title = 'InHumaine';
UPDATE public.scenarios SET scen_id = 'HoW 12' WHERE title = 'Lee''s Charge';
UPDATE public.scenarios SET scen_id = 'HoW 13' WHERE title = 'Hitler''s Bridge';
UPDATE public.scenarios SET scen_id = 'GSTK8'  WHERE title = 'Premature Evaluation';

-- ============================================================
-- Verify: show any rows that did not get a scen_id assigned
-- ============================================================
SELECT id, title, source FROM public.scenarios WHERE scen_id IS NULL ORDER BY source, title;
