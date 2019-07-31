
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/ultScav.js");

var NPScout; // Sensor scout

camAreaEvent("AttackArea1", function(droid)
{
	queue("camCallOnce", camSecondsToMilliseconds(2), "doNPRetreat");
	camManageGroup(camMakeGroup("enemy1Force1", 6), CAM_ORDER_ATTACK, {
		pos: camMakePos("enemy1Force1Pos"),
		fallback: camMakePos("enemy1Force1Fallback"),
		morale: 100
	});
	// pink factory
	camEnableFactory("base1factory");
	// sic! hill factory
	camSetFactoryData("base2factory", {
 		assembly: "assembly2",
		order: CAM_ORDER_ATTACK,  // changes
		data: { pos: "playerBase" }, // changes
		groupSize: 10, // changes
		maxSize: 10,
		throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
		templates: [ cTempl.trike, cTempl.bloke, cTempl.buggy, cTempl.bloke, ] // changes
	});
	camEnableFactory("base2factory"); // re-enable
});

camAreaEvent("AttackArea2", function(droid)
{
	camEnableFactory("base4factory");
});

function doNPRetreat()
{
	var pos = camMakePos("NPSensorTurn");
	if (NPScout)
	{
		camTrace("New Paradigm sensor droid is retreating");
		orderDroidLoc(NPScout, DORDER_MOVE, pos.x, pos.y);
	}
	else
	{
		camTrace("Sensor droid died before retreating.");
	}
}

function eventDestroyed(obj)
{
	if (NPScout && (obj.id === NPScout.id))
	{
		NPScout = null;
		camUnmarkTiles("NPSensorTurn");
		camUnmarkTiles("NPSensorRemove");
	}
}

camAreaEvent("NPSensorTurn", function(droid)
{
	var pos = camMakePos("NPSensorRemove");
	orderDroidLoc(NPScout, DORDER_MOVE, pos.x, pos.y);
});

camAreaEvent("NPSensorRemove", function(droid)
{
	removeObject(NPScout, false);
});

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "SUB_1_1S");
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(["R-Sys-Sensor-Turret01"], 7);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(.5)));
	setAlliance(ULTSCAV, SCAVS, true);

	camSetArtifacts({
		"base1factory": { tech: "R-Wpn-Flamer-Damage01" },
		"base2factory": { tech: "R-Wpn-MG2Mk1" },
		"base4factory": { tech: "R-Vehicle-Engine01" },
		"base3sensor": { tech: "R-Sys-Sensor-Turret01" },
		"base4gen": { tech: "R-Struc-PowerModuleMk1" },
	});

	camSetEnemyBases({
		"base1group": {
			cleanup: "enemybase1",
			detectMsg: "C1B_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
		"base2group": {
			cleanup: "enemybase2",
			detectMsg: "C1B_BASE0",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
		"base3group": {
			cleanup: "enemybase3",
			detectMsg: "C1B_OBJ1",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg",
		},
		"base4group": {
			cleanup: "enemybase4",
			detectMsg: "C1B_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
	});

	camPlayVideos("MB1B_MSG");
	camDetectEnemyBase("base4group"); // power surge detected

	camSetFactories({
		"base1factory": {
			assembly: "assembly1",
			order: CAM_ORDER_ATTACK,
			data: { pos: "playerBase" },
			groupSize: 6,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.trike, cTempl.bloke, cTempl.buggy, cTempl.bloke ]
		},
		"base2factory": { // the hill harass factory
			assembly: "assembly2",
			order: CAM_ORDER_PATROL, // will override later
			data: { // will override later
				pos: [ "patrol1", "patrol2", "patrol3", "patrol4" ],
				interval: camSecondsToMilliseconds(20)
			},
			group: camMakeGroup("hillForce"), // will override later
			groupSize: 4, // will override later
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.bloke ] // will override later
		},
		"base4factory": {
			assembly: "assembly4",
			order: CAM_ORDER_ATTACK,
			data: { pos: "playerBase" },
 			groupSize: 8,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.trike, cTempl.bloke, cTempl.buggy, cTempl.bjeep ]
		},
	});
	camEnableFactory("base2factory");

	//Timed attacks if player dawdles
	queue("eventAreaAttackArea2", camChangeOnDiff(camMinutesToMilliseconds(6)));

	// New Paradigm sensor scout. Now comes with the map!
	NPScout = getObject("npscout");
	camNeverGroupDroid(NPScout);
	var pos = getObject("NPSensorWatch");
	orderDroidLoc(NPScout, DORDER_MOVE, pos.x, pos.y);
	ultScav_eventStartLevel(
		-1, // vtols on/off. -1 = off
		110, // build defense every x seconds
		75, // build factories every x seconds
		-1, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		30, // produce droids every x seconds
		-1, // produce cyborgs every x seconds
		-1, // produce VTOLs every x seconds
		5, // min factories
		-1, // min vtol factories
		-1, // min cyborg factories
		3, // min number of trucks
		3, // min number of sensor droids
		45, // min number of attack droids
		10, // min number of defend droids
		140, // ground attack every x seconds
		-1, // VTOL attack every x seconds
		1); // tech level
}
