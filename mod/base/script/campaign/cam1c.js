
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/ultScav.js");

var ultscav_Heli_group;

function sendRocketForce()
{
	camManageGroup(camMakeGroup("RocketForce"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
}

function sendTankScoutForce()
{
	camManageGroup(camMakeGroup("TankScoutForce"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
	// FIXME: Re-enable this when commander/formation movement
	// becomes good enough. Remove the call above then.
	/*
	camManageGroup(camMakeGroup("TankScoutForce"), CAM_ORDER_FOLLOW, {
		droid: "TankScoutForceCommander",
		order: CAM_ORDER_ATTACK
	});
	*/
}

function sendTankForce()
{
	camManageGroup(camMakeGroup("TankForce"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
	// FIXME: Re-enable this when commander/formation movement
	// becomes good enough. Remove the call above then.
	/*
	camManageGroup(camMakeGroup("TankForce"), CAM_ORDER_FOLLOW, {
		droid: "TankForceCommander",
		order: CAM_ORDER_ATTACK
	});
	*/
}

function enableNPFactory()
{
	camEnableFactory("NPCentralFactory");
}

camAreaEvent("RemoveBeacon", function()
{
	hackRemoveMessage("C1C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
});


function eventDroidBuilt(droid, structure)
{
	if (isVTOL(droid) && camPlayerMatchesFilter(droid.player, ULTSCAV))
	{
		groupAdd(ultscav_Heli_group, droid);
	}
}

function attackVTOLs()
{
	var vtols = enumGroup(ultscav_Heli_group);
	for (var i = 0; i < vtols.length; ++i)
	{
		orderDroidLoc(vtols[i], DORDER_ATTACK, startPosition.x, startPosition.y)
	}
}

camAreaEvent("AmbushTrigger", function()
{
	// wzcam enables factory here, even though it's quite early
	camEnableFactory("ScavCentralFactory");

	camManageGroup(camMakeGroup("AmbushForce"), CAM_ORDER_ATTACK, {
		pos: "AmbushTarget",
		regroup: true,
		count: -1,
	});

	camManageGroup(camMakeGroup("HelicopterForce"), CAM_ORDER_ATTACK, {
		pos: "startPosition",
		regroup: true,
		count: -1,
	});


	SCAV_NAME = 7
	vtol_facts = enumStruct(SCAV_NAME, "A0BaBaVtolFactory");
	for (var j = 0, f = vtol_facts.length; j < f; ++j)
	{
		var fac = vtol_facts[j];
		__camBuildDroid("ScavengerHelicopter", fac)
	}
	setTimer("attackVTOLs", camMinutesToMilliseconds(5));


	// FIXME: Re-enable this when commander/formation movement
	// becomes good enough. Remove the call above then.
	// FIXME: This group has more droids than the commander can handle!
	/*
	camManageGroup(camMakeGroup("AmbushForce"), CAM_ORDER_FOLLOW, {
		droid: "AmbushForceCommander",
		order: CAM_ORDER_ATTACK,
		pos: "AmbushTarget",
	});
	*/
});

camAreaEvent("ScavCentralFactoryTrigger", function()
{
	// doesn't make much sense because the player
	// passes through AmbushTrigger anyway
	// before getting there
	camEnableFactory("ScavCentralFactory");
});

camAreaEvent("ScavNorthFactoryTrigger", function()
{
	camEnableFactory("ScavNorthFactory");
});

camAreaEvent("NPNorthFactoryTrigger", function()
{
	camEnableFactory("NPNorthFactory");
});

function camEnemyBaseEliminated_NPCentralFactory()
{
	camEnableFactory("NPNorthFactory");
}

function getDroidsForNPLZ(args)
{
	var scouts = [ cTempl.npsens, cTempl.nppod, cTempl.nphmg ];
	var heavies = [ cTempl.npslc, cTempl.npsmct, cTempl.npmor ];


	var numScouts = camRand(5) + 1;
	var heavy = heavies[camRand(heavies.length)];
	var list = [];

	for (var i = 0; i < numScouts; ++i)
	{
		list[list.length] = scouts[camRand(scouts.length)];
	}

	for (var a = numScouts; a < 8; ++a)
	{
		list[list.length] = heavy;
	}

	return list;
}

camAreaEvent("NPLZ1Trigger", function()
{
	// Message4 here, Message3 for the second LZ, and
	// please don't ask me why they did it this way
	camPlayVideos("MB1C4_MSG");
	camDetectEnemyBase("NPLZ1Group");

	camSetBaseReinforcements("NPLZ1Group", camChangeOnDiff(camMinutesToMilliseconds(5)), "getDroidsForNPLZ",
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 126, y: 76 },
			exit: { x: 126, y: 36 }
		}
	);
});

camAreaEvent("NPLZ2Trigger", function()
{
	camPlayVideos("MB1C3_MSG");
	camDetectEnemyBase("NPLZ2Group");

	camSetBaseReinforcements("NPLZ2Group", camChangeOnDiff(camMinutesToMilliseconds(5)), "getDroidsForNPLZ",
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 126, y: 76 },
			exit: { x: 126, y: 36 }
		}
	);
});

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CAM_1CA");
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// make sure player doesn't build on enemy LZs of the next level
	for (var i = 1; i <= 5; ++i)
	{
		var ph = getObject("PhantomLZ" + i);
		// HACK: set LZs of bad players, namely 2...6,
		// note: player 1 is NP, player 7 is scavs
		setNoGoArea(ph.x, ph.y, ph.x2, ph.y2, i + 1);
	}

	ultscav_Heli_group = camNewGroup();

	setReinforcementTime(-1);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	setAlliance(NEW_PARADIGM, SCAVS, true);
	setAlliance(ULTSCAV, SCAVS, true);
	setAlliance(ULTSCAV, NEW_PARADIGM, true);

	camCompleteRequiredResearch(CAM1C_RES_NP, NEW_PARADIGM);
	camCompleteRequiredResearch(CAM1C_RES_SCAV, SCAVS);
	camCompleteRequiredResearch(CAM1C_RES_SCAV, ULTSCAV);
	camSetEnemyBases({
		"ScavSouthDerrickGroup": {
			cleanup: "ScavSouthDerrick",
			detectMsg: "C1C_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"ScavSouthEastHighgroundGroup": {
			cleanup: "ScavSouthEastHighground",
			detectMsg: "C1C_BASE6",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"ScavNorthBaseGroup": {
			cleanup: "ScavNorthBase",
			detectMsg: "C1C_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"ScavSouthPodPitsGroup": {
			cleanup: "ScavSouthPodPits",
			detectMsg: "C1C_BASE4",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"ScavCentralBaseGroup": {
			cleanup: "MixedCentralBase", // two bases with same cleanup region
			detectMsg: "C1C_BASE5",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg",
			player: SCAVS // hence discriminate by player filter
		},
		"NPEastBaseGroup": {
			cleanup: "NPEastBase",
			detectMsg: "C1C_BASE7",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NPNorthEastGeneratorGroup": {
			cleanup: "NPNorthEastGenerator",
			detectMsg: "C1C_BASE8",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NPNorthEastBaseGroup": {
			cleanup: "NPNorthEastBase",
			detectMsg: "C1C_BASE9",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NPCentralBaseGroup": {
			cleanup: "MixedCentralBase", // two bases with same cleanup region
			detectMsg: "C1C_BASE10",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
			player: NEW_PARADIGM // hence discriminate by player filter
		},
		"NPLZ1Group": {
			cleanup: "NPLZ1", // kill the four towers to disable LZ
			detectMsg: "C1C_LZ1",
			eliminateSnd: "pcv394.ogg",
			player: NEW_PARADIGM // required for LZ-type bases
		},
		"NPLZ2Group": {
			cleanup: "NPLZ2", // kill the four towers to disable LZ
			detectMsg: "C1C_LZ2",
			eliminateSnd: "pcv394.ogg",
			player: NEW_PARADIGM // required for LZ-type bases
		},
	});

	hackAddMessage("C1C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); // initial beacon
	camPlayVideos(["MB1C_MSG", "MB1C2_MSG"]);

	camSetArtifacts({
		"ScavSouthFactory": { tech: "R-Wpn-Rocket05-MiniPod" },
		"NPResearchFacility": { tech: "R-Struc-Research-Module" },
		"NPCentralFactory": { tech: "R-Vehicle-Prop-Tracks" },
		"NPNorthFactory": { tech: "R-Struc-Factory-Upgrade01" },
		"NPPowGenerator": { tech: "R-Vehicle-Engine02" },
		"ThermalDroid": { tech: "R-Vehicle-Armor-Heat01" },
	});

	camSetFactories({
		"ScavSouthFactory": {
			assembly: "ScavSouthFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.buscan, cTempl.rbjeep, cTempl.trike, cTempl.buggy ]
		},
		"ScavCentralFactory": {
			assembly: "ScavCentralFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.firecan, cTempl.rbuggy, cTempl.bjeep, cTempl.bloke ]
		},
		"ScavNorthFactory": {
			assembly: "ScavNorthFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.firecan, cTempl.rbuggy, cTempl.buscan, cTempl.trike ]
		},
		"NPCentralFactory": {
			assembly: "NPCentralFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.npmor, cTempl.npsens, cTempl.npslc ]
		},
		"NPNorthFactory": {
			assembly: "NPNorthFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 66,
				count: -1,
			},
			templates: [ cTempl.nppod, cTempl.npsmct, cTempl.npmor ]
		},
	});

	camManageTrucks(NEW_PARADIGM);
	replaceTexture("page-7-barbarians-arizona.png", "page-7-barbarians-kevlar.png");

	camEnableFactory("ScavSouthFactory");
	camManageGroup(camMakeGroup("RocketScoutForce"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
	queue("sendRocketForce", camSecondsToMilliseconds(25));
	queue("sendTankScoutForce", camSecondsToMilliseconds(30));
	queue("sendTankForce", camSecondsToMilliseconds(100)); // in wzcam it moves back and then forward
	queue("enableNPFactory", camMinutesToMilliseconds(5));
	ultScav_eventStartLevel(
		1, // vtols on/off. -1 = off
		55, // build defense every x seconds
		75, // build factories every x seconds
		-1, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		45, // produce droids every x seconds
		-1, // produce cyborgs every x seconds
		30, // produce VTOLs every x seconds
		6, // min factories
		6, // min vtol factories
		-1, // min cyborg factories
		4, // min number of trucks
		5, // min number of sensor droids
		25, // min number of attack droids
		10, // min number of defend droids
		55, // ground attack every x seconds
		210, // VTOL attack every x seconds
		1); // tech level
}
