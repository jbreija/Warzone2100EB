

// Port of Ultimate Scavengers Mod into campaign.
var ultScav_MIN_ATTACKERS;
var ultScav_MIN_DEFENDERS;
var ultScav_VTOL_FLAG;
var ultScav_MIN_FACTORIES;
var ultScav_MIN_VTOL_FACTORIES;
var ultScav_MIN_CYB_FACTORIES;
var ultScav_MIN_TRUCKS;
var ultScav_MIN_SENSORS;

var ultScav_baseInfo = [];

const ultScav_oilres = "OilResource";
var ultScav_sensors;
var ultScav_trucks;
var ultScav_vtoltemplates;
var ultScav_templates;
var ultScav_defenses;
var ultScav_vtolpad;
var ultScav_repair;
var ultScav_gen;
var ultScav_vtolfac;
var ultScav_factory;
var ultScav_cybfactory;
var ultScav_derrick;

function ultScav_setTech(tech_level)
{
	if (tech_level === 4) //Late campaign 3
	{
		changePlayerColour(ULTSCAV, 10); // white
		ultScav_derrick = "A0ResourceExtractorMG";
		ultScav_factory = "A0LargeFactory1";
		ultScav_vtolfac = "A0LargeVTolFactory1";
		ultScav_gen = "A0VapPowerGenerator";
		ultScav_repair = "A0RepairCentre4";
		ultScav_vtolpad = "A0VtolPad";
		ultScav_cybfactory = "A0CyborgFactoryMech";

		// attribute names are irrelevant e.g. MGbunker
		ultScav_defenses = {
			MGbunker: "Emplacement-Howitzer03-Rot-Rail-Ram",
			CanTow: "Sys-CB-Tower02", // cb tower for arty wars
			FlameTow: "Emplacement-RailGun3Mk1-Aslt",
			MGTow: "Emplacement-RailGun3Mk1-Hvy",
			RocketPit: "Super-Howitzer105Mk1-Rail-Ram-Empl",// super rail howitzer stabilized
			LancerPit: "Super-Howitzer105Mk1-RailPlas-Empl", // super rail howitzer incnendiary
			MortarPit: "Emplacement-HvART-pit", // arch angel
			MortarPit2: "Sys-NEXUSLinkTOW", // arch angel

		};

		ultScav_templates = {
			bloke: { body: "Body15LGT", prop: "tracked01NAS", weap: "Laser2PULSEMk1-Aslt-Hvy" }, //superior leopard
			trike: { body: "Body16MED", prop: "tracked01NAS", weap: "Laser2PULSEMk1-Inc-Aslt" }, //superior panther
			buggy: { body: "Body13SUP", prop: "tracked01NAS", weap: "RailGun1Mk1" }, // wyvern
			bjeep: { body: "Body14SUP", prop: "tracked01NAS", weap: "HeavyLaser-Inc-Aslt" }, // dragon
		};

		ultScav_vtoltemplates = {
			ScavengerChopper: { body: "Body15LGT", prop: "Helicopter", weap: "Laser2PULSE-VTOL" },
			HeavyChopper: { body: "Body16MED", prop: "V-Tol", weap: "Bomb5-VTOL-Plasmite" },
		};

		ultScav_cyborgs = {
			mg: { body: "CyborgMecha", prop: "MechLegs", weap: "Cyb-Rail1-Mech" }, // Mech cyborgs
			cannon: { body: "CyborgMecha", prop: "MechLegs", weap: "Cyb-Atmiss-Mech" },
			rocket: { body: "CyborgMecha", prop: "MechLegs", weap: "Cyb-Laser-Mech" },
			mortar: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-PulseLsr" },
		};
		ultScav_trucks = {
			Truck1: { body: "Body15LGT", prop: "hover01NAS", weap: "Spade1Hvy" },
			Truck2: { body: "Body15LGT", prop: "hover01NAS", weap: "Spade1Hvy" },
			Truck3: { body: "Body15LGT", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
			Truck4: { body: "Body15LGT", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
		};

		ultScav_sensors = {
			scavsensor: { body: "Body15LGT", prop: "hover01NAS", weap: "Sensor-WideSpec" },
		};
	}
	else if (tech_level === 3)  // Campaign 3
	{
		changePlayerColour(ULTSCAV, 10); // white
		ultScav_derrick = "A0ResourceExtractorMG";
		ultScav_factory = "A0RoboticFactory";
		ultScav_vtolfac = "A0VTolFactory1";
		ultScav_gen = "A0PowerGenerator";
		ultScav_repair = "A0RepairCentre4";
		ultScav_vtolpad = "A0VtolPad";
		ultScav_cybfactory = "A0CyborgFactory";

		ultScav_defenses = {
			MGbunker: "GuardTower-Rail1",
			CanTow: "GuardTower-Rail1",
			FlameTow: "NX-Tower-ATMiss",
			MGTow: "NX-Tower-ATMiss",
			RocketPit: "Empl4-Mortar1Mk1-Rail",
			LancerPit: "Emplacement-HvyATrocket",
			MortarPit: "Empl4-Mortar2Mk1-Rail",
		};

		ultScav_templates = {
			bloke: { body: "Body7ABT", prop: "tracked01NAS", weap: "RailGun1Mk1" }, //retaliation
			trike: { body: "Body7ABT", prop: "tracked01NAS", weap: "RailGun1Mk1" },
			buggy: { body: "Body3MBT", prop: "HalfTrackNAS", weap: "RailGun1Mk1" }, //retribution
			bjeep: { body: "Body3MBT", prop: "HalfTrackNAS", weap: "RailGun1Mk1" },
		};

		ultScav_vtoltemplates = {
			ScavengerChopper: { body: "Body3MBT", prop: "Helicopter", weap: "Rocket-VTOL-HvyA-T" },
			HeavyChopper: { body: "Body3MBT", prop: "Helicopter", weap: "Rocket-VTOL-HvyA-T" },
		};

		ultScav_cyborgs = {
			mg: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-PulseLsr" },
			cannon: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-RailGunner" },
			rocket: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-A-T" },
			mortar: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Wpn-Mortar1Mk1-Rail" },

		};
		ultScav_trucks = {
			Truck1: { body: "Body7ABT", prop: "hover01NAS", weap: "Spade1Hvy" },
			Truck2: { body: "Body7ABT", prop: "hover01NAS", weap: "Spade1Hvy" },
			Truck3: { body: "Body3MBT", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
			Truck4: { body: "Body3MBT", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
		};

		ultScav_sensors = {
			scavsensor: { body: "Body3MBT", prop: "wheeled01NAS", weap: "Sensor-WideSpec" },
		};
	}
	else if (tech_level === 2.5) // Late campaign 2
	{
		changePlayerColour(ULTSCAV, 5); // blue
		ultScav_derrick = "A0ResourceExtractorMG";
		ultScav_factory = "A0RoboticFactory";
		ultScav_vtolfac = "A0VTolFactory1";
		ultScav_gen = "A0PowerGenerator";
		ultScav_repair = "A0RepairCentre4";
		ultScav_vtolpad = "A0VtolPad";
		ultScav_cybfactory = "A0CyborgFactory";

		ultScav_defenses = {
			MGbunker: "X-Super-Rocket",
			CanTow: "WallTower-HvATrocket",
			FlameTow: "Emplacement-Howitzer105",
			MGTow: "X-Super-Rocket",
			RocketPit: "Emplacement-Cannon5VulcanMk1-Hvy",
			LancerPit: "Emplacement-HvyATrocket",
			MortarPit: "Empl3-Mortar3ROTARYMk1-Ram-Rot",
		};

		ultScav_templates = {
			bloke: { body: "Body27SUP", prop: "HalfTrackNAS", weap: "Cannon4AUTOMk1-Hvy-Aslt" },
			trike: { body: "Body25SUP", prop: "tracked01NAS", weap: "Cannon4AUTOMk1-Full-Aslt" },
			buggy: { body: "Body22HVY", prop: "HalfTrackNAS", weap: "Cannon375mmMk1-Twn" },
			bjeep: { body: "Body91REC", prop: "tracked01NAS", weap: "Cannon4AUTOMk1-Hvy-Inc" },
		};

		ultScav_vtoltemplates = {
			ScavengerChopper: { body: "Body21MED", prop: "Helicopter", weap: "Cannon5Vulcan-VTOL" },
			HeavyChopper: { body: "Body61SUPP", prop: "Helicopter", weap: "Cannon5Vulcan-VTOL" },
		};

		ultScav_cyborgs = {
			cannon: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-Acannon" },
			rocket: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-HPV" },
			mortar: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-Mcannon" },
			mg: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-TK" },
			mg1: { body: "CyborgHeavyNAS", prop: "CyborgLegsNAS", weap: "Cyb-Hvywpn-IncMortar" },
		};
		ultScav_trucks = {
			Truck1: { body: "Body20LGT", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
			Truck2: { body: "Body20LGT", prop: "wheeled01NAS", weap: "Spade1Mk1NAS" },
			Truck3: { body: "Body211SUP", prop: "wheeled01NAS", weap: "Spade1Mk1NAS" },
			Truck4: { body: "Body211SUP", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
		};

		ultScav_sensors = {
			scavsensor: { body: "Body211SUP", prop: "HalfTrackNAS", weap: "ScavSensor" },
			scavsensor2: { body: "Body20LGT", prop: "HalfTrackNAS", weap: "ScavSensor" },
		};
	}
	else if (tech_level === 2)
	{
		changePlayerColour(ULTSCAV, 7); // cyan
		ultScav_derrick = "A0ResourceExtractorMG";
		ultScav_factory = "A0RoboticFactory";
		ultScav_vtolfac = "A0VTolFactory1";
		ultScav_gen = "A0PowerGenerator";
		ultScav_repair = "A0RepairCentre4";
		ultScav_vtolpad = "A0VtolPad";
		ultScav_cybfactory = "A0CyborgFactory";

		ultScav_defenses = {
			MGbunker: "Tower2-MG3Mk1-Aslt",
			CanTow: "WallTower-HvATrocket",
			FlameTow: "Emplacement-Howitzer105",
			MGTow: "Empl3-Mortar2Mk1-Ram",
			RocketPit: "Emplacement-Cannon5VulcanMk1-Hvy",
			LancerPit: "Emplacement-HvyATrocket",
			MortarPit: "Empl3-Mortar3ROTARYMk1-Ram-Rot",
		};

		ultScav_templates = {
			bloke: { body: "Body20LGT", prop: "HalfTrackNAS", weap: "Cannon5VulcanMk1-Gat" }, //hardened alloys - viper
			trike: { body: "Body211SUP", prop: "tracked01NAS", weap: "Cannon4AUTOMk1" },
			buggy: { body: "Body61SUPP", prop: "HalfTrackNAS", weap: "Cannon5VulcanMk1-Gat" }, //hardened alloys - cobra
			bjeep: { body: "Body21MED", prop: "tracked01NAS", weap: "Cannon4AUTOMk1" },
		};

		ultScav_vtoltemplates = {
			ScavengerChopper: { body: "Body20LGT", prop: "Helicopter", weap: "Cannon5Vulcan-VTOL" },
			HeavyChopper: { body: "Body211SUP", prop: "Helicopter", weap: "Cannon5Vulcan-VTOL" },
		};

		ultScav_cyborgs = {
			cannon: { body: "CyborgLightNAS", prop: "CyborgLegsNAS", weap: "CyborgCannon" },
			rocket: { body: "CyborgLightNAS", prop: "CyborgLegsNAS", weap: "CyborgRocket" },
			mortar: { body: "CyborgLightNAS", prop: "CyborgLegsNAS", weap: "Cyb-Wpn-Grenade" },
			mg: { body: "CyborgLightNAS", prop: "CyborgLegsNAS", weap: "Cyb-Wpn-Rocket-Pod-Arch" },
			mg1: { body: "CyborgLightNAS", prop: "CyborgLegsNAS", weap: "Cyb-Wpn-Rocket-Pod-MRA" },
			mg2: { body: "CyborgLightNAS", prop: "CyborgLegsNAS", weap: "Cyb-Wpn-Rocket-Sunburst-Arch" },
		};
		ultScav_trucks = {
			Truck1: { body: "Body211SUP", prop: "wheeled01NAS", weap: "Spade1Mk1NAS" },
			Truck2: { body: "Body211SUP", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
			Truck3: { body: "Body20LGT", prop: "wheeled01NAS", weap: "Spade1Mk1NAS" },
			Truck4: { body: "Body20LGT", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
		};

		ultScav_sensors = {
			scavsensor: { body: "Body211SUP", prop: "HalfTrackNAS", weap: "ScavSensor" },
			scavsensor2: { body: "Body20LGT", prop: "HalfTrackNAS", weap: "ScavSensor" },
		};
	}
	else if (tech_level === 1.5)
	{
		changePlayerColour(ULTSCAV, 4); // red
		ultScav_derrick = "A0ResourceExtractor";
		ultScav_factory = "A0LightFactory";
		ultScav_vtolfac = "A0VTolFactory1";
		ultScav_gen = "A0PowerGenerator";
		ultScav_repair = "A0RepairCentre2";
		ultScav_vtolpad = "A0VtolPad";
		ultScav_cybfactory = "A0CyborgFactory";

		ultScav_defenses = {
			FlameTow: "Emplacement-MortarPit01",
			MGTow: "GuardTower5",
			RocketPit: "GuardTower4",
			LancerPit: "Tower-Projector",
			MortarPit: "PillBox5",
		};

		ultScav_templates = {
			bloke: { body: "Body18MED", prop: "hover01NAS", weap: "Flame1Mk1" }, // thermal scorpion flamer
			trike: { body: "Body18MED", prop: "hover01NAS", weap: "Flame2" },
			bjeep: { body: "Body19HVY", prop: "hover01NAS", weap: "Flame2" }, // thermal mantis flamer
		};

		ultScav_vtoltemplates = {
			ScavengerChopper: { body: "Body88MBT", prop: "Helicopter", weap: "Cannon1-VTOL" }, // NASDA Scorpion
			HeavyChopper: { body: "Body88MBT", prop: "Helicopter", weap: "Rocket-VTOL-TopAttackHvy" },
			ScavengerChopper1: { body: "Body45ABT", prop: "Helicopter", weap: "Rocket-VTOL-Pod3" }, // NASDA Bug
			HeavyChopper1: { body: "Body45ABT", prop: "Helicopter", weap: "Rocket-VTOL-LtA-T" },
		};

		ultScav_cyborgs = {
			cannon: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannon" },
			rocket: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRocket" },
			mortar: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Thermite" },
			mg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgChaingun" },

		};
		ultScav_trucks = {
			Truck1: { body: "Body17LGT", prop: "hover01NAS", weap: "Spade1Mk1NAS" },
		};

		ultScav_sensors = {
			scavsensor: { body: "Body17LGT", prop: "hover01NAS", weap: "ScavSensor" },
		};
	}
	else
	{
		changePlayerColour(ULTSCAV, 4); // red
		ultScav_derrick = "A0ResourceExtractor";
		ultScav_factory = "A0BaBaFactory";
		ultScav_vtolfac = "A0BaBaVtolFactory";
		ultScav_gen = "A0BaBaPowerGenerator";
		ultScav_repair = "ScavRepairCentre";
		ultScav_vtolpad = "A0BaBaVtolPad";
		ultScav_cybfactory = "A0CyborgFactory";

		ultScav_defenses = {
			MGbunker: "A0BaBaBunker",
			CanTow: "A0CannonTower",
			FlameTow: "A0BaBaFlameTower",
			MGTow: "bbaatow",
			RocketPit: "A0BaBaRocketPit",
			LancerPit: "A0BaBaRocketPitAT",
			MortarPit: "A0BaBaMortarPit",
		};

		ultScav_templates = {
			bloke: { body: "B1BaBaPerson01", prop: "BaBaLegs", weap: "BabaMG" },
			trike: { body: "B4body-sml-trike01", prop: "BaBaProp", weap: "BabaTrikeMG" },
			buggy: { body: "B3body-sml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" },
			bjeep: { body: "B2JeepBody", prop: "BaBaProp", weap: "BabaJeepMG" },

			rbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaRocket" },
			rbuggy: { body: "B3bodyRKbuggy01", prop: "BaBaProp", weap: "BabaRocket" },
		};

		ultScav_vtoltemplates = {
			ScavengerChopper: { body: "ScavengerChopper", prop: "Helicopter", weap: "MG1-VTOL" },
			HeavyChopper: { body: "HeavyChopper", prop: "Helicopter", weap: "Rocket-VTOL-Pod" },
		};

		ultScav_cyborgs = {
			mg: { body: "CyborgLightNAS", prop: "CyborgLegsNAS", weap: "CyborgChaingun" },

		};
		ultScav_trucks = {
			Truck1: { body: "B2crane1", prop: "BaBaProp", weap: "scavCrane1" },
			Truck2: { body: "B2crane1", prop: "BaBaProp", weap: "scavCrane2" },
			Truck3: { body: "B2crane2", prop: "BaBaProp", weap: "scavCrane1" },
			Truck4: { body: "B2crane2", prop: "BaBaProp", weap: "scavCrane2" },
		};

		ultScav_sensors = {
			scavsensor: { body: "BusBody-AR", prop: "BaBaProp", weap: "ScavSensor" },
		};
	}
}
// unit limit constant
function ultScav_atLimits()
{
	return enumDroid(ULTSCAV).length > 199;
}

// random integer between 0 and max-1 (for convenience)
function ultScav_random(max)
{
	return (max <= 0) ? 0 : Math.floor(Math.random() * max);
}

// Returns true if something is defined
function ultScav_isDefined(data)
{
	return typeof(data) !== "undefined";
}

function ultScav_log(message)
{
	dump(gameTime + " : " + message);
}

function ultScav_logObj(obj, message)
{
	dump(gameTime + " [" + obj.name + " id=" + obj.id + "] > " + message);
}

function ultScav_isHeli(droid)
{
	return droid.propulsion === "Helicopter";
}

// Make sure a unit does not try to go off map
function ultScav_mapLimits(x, y, num1, num2, xOffset, yOffset)
{
	var coordinates = [];
	var xPos = x + xOffset + ultScav_random(num1) - num2;
	var yPos = y + yOffset + ultScav_random(num1) - num2;

	if(xPos < 2)
	xPos = 2;
	if(yPos < 2)
	yPos = 2;
	if(xPos >= mapWidth - 2)
	xPos = mapWidth - 3;
	if(yPos >= mapHeight - 2)
	yPos = mapHeight - 3;

	return {"x": xPos, "y": yPos};
}

//Return a closeby enemy object. Will be undefined if none.
function ultScav_rangeStep(obj, visibility)
{
	const STEP = 1000;
	var target;

	for(var i = 0; i <= 30000; i += STEP)
	{
		var temp = enumRange(obj.x, obj.y, i, 0, visibility);
		if(ultScav_isDefined(temp[0]))
		{
			target = temp[0];
			break;
		}
	}

	return target;
}

function ultScav_constructbaseInfo(x, y)
{
	this.x = x;
	this.y = y;
	this.defendGroup = camNewGroup(); // tanks to defend the base
	this.builderGroup = camNewGroup(); // trucks to build base structures and ultScav_defenses
	this.attackGroup = camNewGroup(); // tanks to attack nearby things
	this.ultScav_factoryNumber = ultScav_baseInfo.length;
}

function ultScav_findNearest(list, x, y, flag)
{
	var minDist = Infinity, minIdx;
	for (var i = 0, l = list.length; i < l; ++i)
	{
		var d = distBetweenTwoPoints(list[i].x, list[i].y, x, y);
		if (d < minDist)
		{
			minDist = d;
			minIdx = i;
		}
	}
	return (flag === true) ? list[minIdx] : minIdx;
}

function ultScav_regroup()
{
	var list = enumDroid(ULTSCAV);
	for (var i = 0; i < list.length; ++i)
	{
		var droid = list[i];
		if (droid.group === null)
		{
			ultScav_addDroidToSomeGroup(droid);
		}
	}
}

function ultScav_addDroidToSomeGroup(droid)
{

	var base = ultScav_findNearest(ultScav_baseInfo, droid.x, droid.y, true);

	if (!camDef(base))
	{
		var n = ultScav_baseInfo.length;
		if (n === 0 && ultScav_buildStructure(droid, ultScav_factory))
		{
			ultScav_baseInfo[n] = new ultScav_constructbaseInfo(droid.x, droid.y);
			groupAddDroid(ultScav_baseInfo[n].builderGroup, droid);
			return;
		}
		return;
	}

	switch(droid.droidType)
	{
		case DROID_CONSTRUCT:
		{
			groupAddDroid(base.builderGroup, droid);
			break;
		}
		case DROID_WEAPON:
		{
			if (groupSize(base.defendGroup) < ultScav_MIN_DEFENDERS)
			{
				groupAddDroid(base.defendGroup, droid);
			}
			else if(groupSize(base.attackGroup) < ultScav_MIN_ATTACKERS)
			{
				groupAddDroid(base.attackGroup, droid);
				break;
			}
			else
			{
				var rBase = ultScav_random(ultScav_baseInfo.length);
				groupAddDroid(ultScav_baseInfo[rBase].attackGroup, droid);
			}
		}
		break;
		case DROID_SENSOR:
		{
			groupAddDroid(base.attackGroup, droid);
		}
		break;

		case DROID_PERSON:
		{
			groupAddDroid(base.attackGroup, droid);
		}
		break;

		case DROID_CYBORG:
		{
			groupAddDroid(base.attackGroup, droid);
		}
		break;
	}
}

function ultScav_groupOfTank(droid)
{
	for (var i = 0, b = ultScav_baseInfo.length; i < b; ++i)
	{
		if (droid.group === ultScav_baseInfo[i].attackGroup)
		{
			return ultScav_baseInfo[i].attackGroup;
		}
	}
}

function ultScav_buildStructure(droid, stat)
{
	if ((droid.order !== DORDER_BUILD))
	{

		var loc = pickStructLocation(droid, stat, droid.x, droid.y, 0);
		if(ultScav_isDefined(loc))
		{
			if(orderDroidBuild(droid, DORDER_BUILD, stat, loc.x, loc.y));
			{
				return true;
			}
		}


		switch(stat)
		{
			case ultScav_derrick:
			{
				queue("ultScav_buildOils", camSecondsToMilliseconds(5));
				return false;
			}
			case ultScav_factory:
			{
				queue("ultScav_buildFactories", camSecondsToMilliseconds(5));
				return false;
			}
			case ultScav_gen:
			{
				queue("ultScav_buildOils", camSecondsToMilliseconds(5));
				return false;
			}
			case ultScav_repair:
			{
				queue("ultScav_buildThings", camSecondsToMilliseconds(5));
				return false;
			}
			case ultScav_vtolfac:
			{
				queue("ultScav_buildvtolFactories", camSecondsToMilliseconds(5));
				return false;
			}
			case ultScav_vtolpad:
			{
				queue("ultScav_buildvtolFactories", camSecondsToMilliseconds(5));
				return false;
			}
			case ultScav_cybfactory:
			{
				queue("ultScav_buildCybFactories", camSecondsToMilliseconds(5));
				return false;
			}
		}
	}
	return false;
}

function ultScav_randomAttrib(obj)
{
	var keys = Object.keys(obj);
	return obj[keys[ camRand(keys.length)]];
}
function ultScav_buildTower(droid)
{
	var random_defense = ultScav_randomAttrib(ultScav_defenses);
	return ultScav_buildStructure(droid, random_defense);
}



function ultScav_findTruck()
{
	var list = enumDroid(ULTSCAV, DROID_CONSTRUCT).filter(function(dr) {
		return (dr.order !== DORDER_BUILD);
	});
	return list;
}

function ultScav_buildOils()
{
	var list = ultScav_findTruck();

	for (var i = 0, d = list.length; i < d; ++i)
	{
		var droid = list[i];
		if ((countStruct(ultScav_derrick, ULTSCAV) - ((countStruct(ultScav_gen, ULTSCAV) * 4))) > 0)
		{
			ultScav_buildStructure(droid, ultScav_gen);
		}

		if (!ultScav_checkAndrepair(droid))
		{
			var result = ultScav_findNearest(enumFeature(ALL_PLAYERS, ultScav_oilres), droid.x, droid.y, true);
			if (ultScav_isDefined(result))
				orderDroidBuild(droid, DORDER_BUILD, ultScav_derrick, result.x, result.y);
		}
	}
}


function ultScav_buildFactories()
{
	var list = enumDroid(ULTSCAV, DROID_CONSTRUCT);

	if (countStruct(ultScav_factory, ULTSCAV) < ultScav_MIN_FACTORIES)
	{
		for (var i = 0, d = list.length; i < d; ++i)
		{
			var droid = list[i];
			var base = ultScav_findNearest(ultScav_baseInfo, droid.x, droid.y, true);
			if (!camDef(base))
			{
				var n = ultScav_baseInfo.length;
				if (n === 0 && ultScav_buildStructure(droid, ultScav_factory))
				{
					ultScav_baseInfo[n] = new ultScav_constructbaseInfo(droid.x, droid.y);
					groupAddDroid(ultScav_baseInfo[n].builderGroup, droid);
					return;
				}
				return;
			}

			var dist = distBetweenTwoPoints(base.x, base.y, droid.x, droid.y);
			//dist makes sure that factories are not built too close to eachother
			if ((dist > 5) && ultScav_buildStructure(droid, ultScav_factory))
			{
				var n = ultScav_baseInfo.length;
				ultScav_baseInfo[n] = new ultScav_constructbaseInfo(droid.x, droid.y);
				groupAddDroid(ultScav_baseInfo[n].builderGroup, droid);
				return true;
			}
			return false;
		}
	}
}

function ultScav_buildvtolFactories()
{
	var list = ultScav_findTruck();

	if (countStruct(ultScav_vtolfac, ULTSCAV) < ultScav_MIN_VTOL_FACTORIES)
	{
		for (var i = 0, d = list.length; i < d; ++i)
		{
			var droid = list[i];
			ultScav_buildStructure(droid, ultScav_vtolfac);
		}
	}
	else if (countStruct(ultScav_vtolpad, ULTSCAV < (ultScav_countHelicopters() * 3)))
	{
		for (var i = 0, d = list.length; i < d; ++i)
		{
			var droid = list[i];
			ultScav_buildStructure(droid, ultScav_vtolpad);
		}
	}
}

function ultScav_buildCybFactories()
{
	var list = ultScav_findTruck();

	if (countStruct(ultScav_cybfactory, ULTSCAV) < ultScav_MIN_CYB_FACTORIES)
	{
		for (var i = 0, d = list.length; i < d; ++i)
		{
			var droid = list[i];
			ultScav_buildStructure(droid, ultScav_cybfactory);
		}
	}

}

function ultScav_buildThings()
{
	var list = ultScav_findTruck();

	function isBuilt(structure)
	{
		return structure.status === BUILT;
	}

	for (var i = 0, d = list.length; i < d; ++i)
	{
		var droid = list[i];
		if (!ultScav_checkAndrepair(droid))
		{
			if ((countStruct(ultScav_derrick, ULTSCAV) - ((countStruct(ultScav_gen, ULTSCAV) * 4))) > 0)
				ultScav_buildStructure(droid, ultScav_gen);
			if ((enumStruct(ULTSCAV, ultScav_repair).filter(isBuilt) < 2))
			{
				ultScav_buildStructure(droid, ultScav_repair);
			}
			if (gameTime > camSecondsToMilliseconds(30))
				ultScav_buildTower(droid);
		}
	}
}

function ultScav_attackOils()
{
	var list = ultScav_findTruck();

	for (var i = 0, d = list.length; i < d; ++i)
	{
		var droid = list[i];
		if (!ultScav_checkAndrepair(droid))
		{
			var dlist = enumStruct(0, ultScav_derrick);
			if (dlist !== undefined && dlist.length > 0) {
					// array empty or does not exist

				for (var r = 0; r < dlist.length; ++r)
				{
					var enemy_ultScav_derrick = dlist[r];
					if(distBetweenTwoPoints(droid.x, droid.y, enemy_ultScav_derrick.x, enemy_ultScav_derrick.y) < 12)
					{
						ultScav_buildTower(droid);
					}
				}
			}
		}
	}
}

function ultScav_produceTruck()
{
	if (countDroid(DROID_CONSTRUCT, ULTSCAV) < ultScav_MIN_TRUCKS)
	{
		var list = enumStruct(ULTSCAV, ultScav_factory);
		for (var i = 0, f = list.length; i < f; ++i)
		{
			var fac = list[i];

			if (fac.status === BUILT)
			{
				var truck_list = [];
				for(var key in ultScav_trucks) {
					truck_list.push(key);
				}
				var random_template = truck_list[camRand(truck_list.length)];
				__camBuildDroid(ultScav_trucks[random_template], fac);
			}
		}
	}
}

function ultScav_produceSensor()
{
	if (countDroid(DROID_SENSOR, ULTSCAV) < ultScav_MIN_SENSORS)
	{
		var list = enumStruct(ULTSCAV, ultScav_factory);

		for (var i = 0, f = list.length; i < f; ++i)
		{
			var fac = list[i];

			if (ultScav_structureReady(fac))
			{
				var sensor_list = [];
				for(var key in ultScav_sensors) {
					sensor_list.push(key);
				}
				var random_template = sensor_list[camRand(sensor_list.length)];
				__camBuildDroid(ultScav_sensors[random_template], fac);
			}
		}
	}
}

function ultScav_produceDroid()
{
	var list = enumStruct(ULTSCAV, ultScav_factory);
	for (var i = 0, f = list.length; i < f; ++i)
	{
		var fac = list[i];

		if (ultScav_structureReady(fac))
		{
			var template_list = [];
			for(var key in ultScav_templates) {
				template_list.push(key);
			}
			var random_template = template_list[camRand(template_list.length)];
			__camBuildDroid(ultScav_templates[random_template], fac);
		}
	}
}

function ultScav_produceHelicopter()
{
	var list = enumStruct(ULTSCAV, ultScav_vtolfac);
	for (var i = 0, f = list.length; i < f; ++i)
	{
		var fac = list[i];
		if (ultScav_structureReady(fac))
		{
			var template_list = [];
			for(var key in ultScav_vtoltemplates) {
				template_list.push(key);
			}
			var random_template = template_list[camRand(template_list.length)];
			__camBuildDroid(ultScav_vtoltemplates[random_template], fac);
		}
	}
}

function ultScav_structureReady(struct)
{
	return (structureIdle(struct) && struct.status === BUILT);
}

function ultScav_produceCyborg()
{
	var list = enumStruct(ULTSCAV, ultScav_cybfactory);
	for (var i = 0, f = list.length; i < f; ++i)
	{
		var fac = list[i];
		if (ultScav_structureReady(fac))
		{
			var template_list = [];
			for(var key in ultScav_cyborgs) {
				template_list.push(key);
			}
			var random_template = template_list[camRand(template_list.length)];
			__camBuildDroid(ultScav_cyborgs[random_template], fac);
		}
	}
}

function ultScav_checkAndrepair(droid)
{
	const MIN_HEALTH = 55;
	if (droid !== null)
	{
		if (!(ultScav_isHeli(droid) || (droid.order === DORDER_BUILD)))
		{
			if (droid.health < MIN_HEALTH)
			{
				return orderDroid(droid, DORDER_RTR);
			}
		}
	}
	return false;
}

function ultScav_attackWithDroid(droid, target, force)
{
	if (droid !== null)
	{
		if(ultScav_checkAndrepair(droid))
		{
			return;
		}

		if (droid.droidType === DROID_WEAPON)
		{
			if ((droid.order !== DORDER_ATTACK) || force)
			{
				orderDroidObj(droid, DORDER_ATTACK, target);
			}
		}
		else if(droid.droidType === DROID_SENSOR)
		{
			if ((droid.order !== DORDER_OBSERVE) || force)
			{
				orderDroidObj(droid, DORDER_OBSERVE, target);
			}
		}
	}
}

function ultScav_helicopterArmed(obj, percent)
{
	for (var i = 0; i < obj.weapons.length; ++i)
	{
		if (obj.weapons[i].armed >= percent)
		{
			return true;
		}
	}

	return false;
}


function ultScav_helicopterReady(droid)
{
	const ARMED_PERCENT = 1;

	if ((droid.order === DORDER_ATTACK) || (droid.order === DORDER_REARM))
	{
		return false;
	}

	if (ultScav_helicopterArmed(droid, ARMED_PERCENT))
	{
		return true;
	}

	if (droid.order !== DORDER_REARM)
	{
		orderDroid(droid, DORDER_REARM);
	}

	return false;
}

//Helicopters can only attack things that the scavengers have seen
function ultScav_helicopterAttack()
{
	var list = ultScav_findFreeHelicopters();

	if (!ultScav_isDefined(list[0]))
	{
		return;
	}

	var target = ultScav_rangeStep(ultScav_baseInfo[ultScav_random(ultScav_baseInfo.length)], true);

	for (var i = 0, l = list.length; i < l; ++i)
	{
		var droid = list[i];
		var coords = [];

		if(ultScav_isDefined(target))
		{
			coords = ultScav_mapLimits(target.x, target.y, 5, 2, 0, 0);
		}
		else
		{
			var xOff = ultScav_random(2);
			var yOff = ultScav_random(2);
			xOff = (!xOff) ? -ultScav_random(10) : ultScav_random(10);
			yOff = (!yOff) ? -ultScav_random(10) : ultScav_random(10);
			coords = ultScav_mapLimits(droid.x, droid.y, 5, 2, xOff, yOff);
		}

		orderDroidLoc(droid, DORDER_SCOUT, coords.x, coords.y);
	}
}

function ultScav_countHelicopters()
{
	var helis = enumDroid(ULTSCAV).filter(function(object) {
		return ultScav_isHeli(object);
	});

	return helis.length;
}

function ultScav_findFreeHelicopters(count)
{
	return enumDroid(ULTSCAV).filter(function(object) {
		return (ultScav_isHeli(object) && ultScav_helicopterReady(object));
	});
}

function ultScav_groundAttackStuff()
{
	if(!ultScav_baseInfo.length)
	{
		return;
	}

	var target = ultScav_rangeStep(ultScav_baseInfo[ultScav_random(ultScav_baseInfo.length)], true);

	if(ultScav_isDefined(target))
	{

		for (var i = 0, l = ultScav_baseInfo.length; i < l; ++i)
		{
			var base = ultScav_baseInfo[i];
			var attackDroids = enumGroup(base.attackGroup);
			if(ultScav_isDefined(target) && (attackDroids.length > ultScav_MIN_ATTACKERS))
			{
				for (var j = 0, k = attackDroids.length; j < k; ++j)
				{
					ultScav_attackWithDroid(attackDroids[j], target, false);
				}
			}
		}
	}
}

function ultScav_retreat()
{
	var list = enumDroid(ULTSCAV);
	for (var i = 0; i < list.length; ++i)
	{
		var droid = list[i];
		if (!isVTOL(droid))
		{
			if (droid.health < 80)
			{
				orderDroid(droid, DORDER_RTR);
			}
		}
	}
}


// does not work yet
function ultScav_transporterDroids()
{
	var droids = [];
	var count = 6 + camRand(5);

	var droid_list = [];
	for(var key in ultScav_templates) {
		droid_list.push(key);
	}

	var truck_list = [];
	for(var key in ultScav_trucks) {
		truck_list.push(key);
	}

	for (var i = 0; i < count; ++i)
	{
		droids.push(droid_list[camRand(droid_list.length)]);
	}
	return droids;
}

// does not work yet
function ultScav_reinforcements()
{
	var random_x = camRand(mapWidth);
	var random_y = camRand(mapHeight);
	var playerUnits = enumDroid(CAM_HUMAN_PLAYER).filter(function(droid) {
		return !isVTOL(droid);
	});

	if (!playerUnits.length)
	{
		return;
	}
	var aPlayerUnit = playerUnits[0];

	while (!propulsionCanReach("hover01", aPlayerUnit.x, aPlayerUnit.y, random_x, random_y))
	{
		random_x = camRand(mapWidth);
		random_y = camRand(mapHeight);
	}
	var nearbyDefense = enumRange(random_x, random_y, 4, CAM_HUMAN_PLAYER, false);

	if (!nearbyDefense.length)
	{
		var list = ultScav_transporterDroids();
		camSendReinforcement(ULTSCAV, camMakePos(random_x, random_y), list,
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: camRand(mapWidth), y: camRand(mapHeight) },
				exit: { x: camRand(mapWidth), y: camRand(mapHeight) }
			}
		);
	}

	queue("ultScav_reinforcements", camChangeOnDiff(camMinutesToMilliseconds(1)));
}

function ultScav_eventStartLevel(
	vtol_flag,
	build_defense,
	build_factories,
	build_cybfactories,
	produce_trucks,
	produce_droids,
	produce_cyborgs,
	produce_vtols,
	min_factories,
	min_vtol_factories,
	min_cyborg_factories,
	min_trucks,
	min_sensors,
	min_attackers,
	min_defenders,
	ground_attack,
	vtol_attack,
	tech_level)
{
	ultScav_setTech(tech_level);
	ultScav_VTOL_FLAG = vtol_flag;
	ultScav_MIN_FACTORIES = min_factories;
	ultScav_MIN_VTOL_FACTORIES = min_vtol_factories;
	ultScav_MIN_CYB_FACTORIES = min_cyborg_factories;
	ultScav_MIN_TRUCKS = min_trucks;
	ultScav_MIN_SENSORS = min_sensors;
	ultScav_MIN_ATTACKERS = min_attackers;
	ultScav_MIN_DEFENDERS = min_defenders;

	var list = enumStruct(ULTSCAV, ultScav_factory);
	for (var i = 0, l = list.length; i < l; ++i)
	{
		var fac = list[i];
		ultScav_baseInfo[i] = new ultScav_constructbaseInfo(fac.x, fac.y);
	}

	for (var k in ultScav_defenses) {
		if (ultScav_defenses.hasOwnProperty(k)) {
			enableStructure(ultScav_defenses[k], ULTSCAV);
		}
	}

	enableStructure(ultScav_gen, ULTSCAV);
	enableStructure(ultScav_factory, ULTSCAV);
	enableStructure(ultScav_derrick, ULTSCAV);
	enableStructure(ultScav_vtolpad, ULTSCAV);
	enableStructure(ultScav_repair, ULTSCAV);
	enableStructure(ultScav_vtolfac, ULTSCAV);
	enableStructure(ultScav_cybfactory, ULTSCAV);

	// general behavior
	ultScav_produceTruck();
	queue("ultScav_buildOils", camChangeOnDiff(camSecondsToMilliseconds(35)));
	setTimer("ultScav_buildOils", camChangeOnDiff(camSecondsToMilliseconds(130)));
	setTimer("ultScav_regroup", camChangeOnDiff(camSecondsToMilliseconds(60)));
	setTimer("ultScav_retreat", camChangeOnDiff(camSecondsToMilliseconds(50)));
	setTimer("ultScav_attackOils", camChangeOnDiff(camSecondsToMilliseconds(85)));
	setTimer("ultScav_produceSensor", camChangeOnDiff(camSecondsToMilliseconds(130)));

	// parameterized behavior
	if (produce_trucks !== -1)
		setTimer("ultScav_produceTruck", camChangeOnDiff(camSecondsToMilliseconds(produce_trucks)));
	if (produce_droids !== -1)
		setTimer("ultScav_produceDroid", camChangeOnDiff(camSecondsToMilliseconds(produce_droids)));
	if (produce_cyborgs !== -1)
		setTimer("ultScav_produceCyborg", camChangeOnDiff(camSecondsToMilliseconds(produce_cyborgs)));
	if (build_factories !== -1)
		setTimer("ultScav_buildFactories", camChangeOnDiff(camSecondsToMilliseconds(build_factories)));
	if (build_cybfactories !== -1)
		setTimer("ultScav_buildCybFactories", camChangeOnDiff(camSecondsToMilliseconds(build_cybfactories)));
	if (build_defense !== -1)
		setTimer("ultScav_buildThings", camChangeOnDiff(camSecondsToMilliseconds(build_defense)));
	if (ground_attack !== -1)


	// vtol behavior
	if (ultScav_VTOL_FLAG !== -1)
	{
		if (produce_vtols !== -1)
			setTimer("ultScav_buildvtolFactories", camChangeOnDiff(camSecondsToMilliseconds(produce_vtols)));
		if (produce_vtols !== -1)
			setTimer("ultScav_produceHelicopter", camChangeOnDiff(camSecondsToMilliseconds(produce_vtols)));
		if (vtol_attack !== -1)
			setTimer("ultScav_helicopterAttack", camChangeOnDiff(camSecondsToMilliseconds(vtol_attack)));
	}
}
