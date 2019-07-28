
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include ("script/campaign/ultScav.js");

const warning = "pcv632.ogg"; // Collective commander escaping
var commandGroup;

camAreaEvent("vtolRemoveZone", function(droid)
{
	if (isVTOL(droid) && (droid.weapons[0].armed < 20) || (droid.health < 60))
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("vtolRemoveZone", THE_COLLECTIVE);
});


camAreaEvent("group1Trigger", function(droid)
{
	hackRemoveMessage("C22_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	camEnableFactory("COFactoryEast");

	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint1"),
		radius: 0,
		regroup: false,
	});
});

camAreaEvent("wayPoint1Rad", function(droid)
{
	if (isVTOL(droid))
	{
		resetLabel("wayPoint1Rad", THE_COLLECTIVE);
		return;
	}
	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint3"),
		radius: 0,
		regroup: false,
	});
});

//Tell player that Collective Commander is leaving and group all droids
//that can attack together to defend the enemy commander.
camAreaEvent("wayPoint2Rad", function(droid)
{
	if (droid.droidType !== DROID_COMMAND)
	{
		resetLabel("wayPoint2Rad", THE_COLLECTIVE);
		return;
	}

	var point = getObject("wayPoint3");
	var defGroup = enumRange(point.x, point.y, 10, THE_COLLECTIVE, false).filter(function(obj) {
		return (obj.droidType === DROID_WEAPON);
	});

	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint4"),
		radius: 0,
		regroup: false
	});

	camManageGroup(camMakeGroup(defGroup), CAM_ORDER_DEFEND, {
		pos: camMakePos("defensePos"),
		regroup: false,
		radius: 10,
		repair: 67,
	});

	playSound(warning);
});

camAreaEvent("failZone", function(droid)
{
	if (droid.droidType === DROID_COMMAND)
	{
		camSafeRemoveObject(droid, false);
		failSequence();
	}
	else
	{
		resetLabel("failZone");
	}
});

function vtolAttack()
{
	var list = [cTempl.colatv, cTempl.colatv];
	camSetVtolData(THE_COLLECTIVE, "vtolAppearPoint", "vtolRemovePoint", list, camChangeOnDiff(camMinutesToMilliseconds(5)), "COCommandCenter");
}

//Order the truck to build some defenses.
function truckDefense()
{
	if (enumDroid(THE_COLLECTIVE, DROID_CONSTRUCT).length > 0)
	{
		queue("truckDefense", camSecondsToMilliseconds(160));
	}

	const list = ["WallTower06", "PillBox1", "WallTower03"];
	camQueueBuilding(THE_COLLECTIVE, list[camRand(list.length)]);
}

function showGameOver()
{
	var arti = camGetArtifacts();
	camSafeRemoveObject(arti[0], false);
	gameOverMessage(false);
}

function failSequence()
{
	queue("showGameOver", camSecondsToMilliseconds(0.3));
}

function retreatCommander()
{
	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint3"),
		radius: 6,
		repair: 67,
		regroup: false
	});
}

//Make the enemy commander flee back to the NW base if attacked.
function eventAttacked(victim, attacker)
{
	if (camDef(victim) &&
		victim.player === THE_COLLECTIVE &&
		victim.y > Math.floor(mapHeight / 3) && //only if the commander is escaping to the south
		victim.group === commandGroup)
	{
		camCallOnce("retreatCommander");
	}
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CAM_2C",{
		area: "RTLZ",
		message: "C22_LZ",
		reinforcements: camMinutesToSeconds(3)
	});

	var startpos = getObject("startPosition");
	var lz = getObject("landingZone"); //player lz
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	setAlliance(2, 7, true);
	var enemyLz = getObject("COLandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, THE_COLLECTIVE);

	camSetArtifacts({
		"COCommander": { tech: "R-Wpn-Rocket-Accuracy02" },
		"COFactoryEast": { tech: "R-Struc-Materials04" },
		"PepperPotEmp": { tech: "R-Wpn-Mortar3" },
		"RoboticRepair": { tech: "R-Struc-RprFac-Upgrade04" },
	});
	
	camCompleteRequiredResearch(CAM2_2_RES_COL, THE_COLLECTIVE);

	camSetEnemyBases({
		"COEastBase": {
			cleanup: "eastBaseCleanup",
			detectMsg: "C22_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"COWestBase": {
			cleanup: "westBaseCleanup",
			detectMsg: "C22_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"COFactoryEast": {
			assembly: camMakePos("eastAssembly"),
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.cohct, cTempl.comtathh, cTempl.comorb] //Heavy factory
		},
		"COFactoryWest": {
			assembly: camMakePos("westAssembly"),
			order: CAM_ORDER_DEFEND,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			data: {
				pos: camMakePos("westAssembly"),
				regroup: false,
				repair: 67,
				radius: 18,
				count: -1,
			},
			templates: [cTempl.comtath] //Hover lancers
		},
	});

	commandGroup = camMakeGroup("group1NBase");
	camManageTrucks(THE_COLLECTIVE);
	truckDefense();
	camEnableFactory("COFactoryWest");

	hackAddMessage("C22_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, true);

	queue("vtolAttack", camMinutesToMilliseconds(2));
	ultScav_eventStartLevel(
		-1, // vtols on/off. -1 = off
		25, // build defense every x seconds
		75, // build factories every x seconds
		35, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		20, // produce droids every x seconds
		15, // produce cyborgs every x seconds
		-1, // produce VTOLs every x seconds
		2, // min factories
		-1, // min vtol factories
		10, // min cyborg factories
		3, // min number of trucks
		-1, // min number of sensor droids
		10, // min number of attack droids
		3, // min number of defend droids
		210, // ground attack every x seconds
		-1, // VTOL attack every x seconds
		2); // tech level
}
