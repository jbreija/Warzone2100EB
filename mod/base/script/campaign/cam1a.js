include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/ultScav.js");


// Player zero's droid enters area next to first oil patch.
camAreaEvent("launchScavAttack", function(droid)
{
	camPlayVideos(["pcv456.ogg", "MB1A_MSG"]);
	hackAddMessage("C1A_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);
	// Send scavengers on war path if triggered above.
	camManageGroup(camMakeGroup("scavAttack1", ENEMIES), CAM_ORDER_ATTACK, {
		pos: camMakePos("playerBase"),
		fallback: camMakePos("retreat1"),
		morale: 50
	});
	// Activate mission timer, unlike the original campaign.
	if (difficulty !== HARD && difficulty !== INSANE)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(30)));
	}
});

function runAway()
{
	var oilPatch = getObject("oilPatch");
	var droids = enumRange(oilPatch.x, oilPatch.y, 7, 7, false);
	camManageGroup(camMakeGroup(droids), CAM_ORDER_ATTACK, {
		pos: camMakePos("scavAttack1"),
		fallback: camMakePos("retreat1"),
		morale: 20 // Will run away after losing a few people.
	});
}

function doAmbush()
{
	camManageGroup(camMakeGroup("roadblockArea"), CAM_ORDER_ATTACK, {
		pos: camMakePos("oilPatch"),
		fallback: camMakePos("retreat2"),
		morale: 50 // Will mostly die.
	});
}

// Area with the radar blip just before the first scavenger outpost.
camAreaEvent("scavAttack1", function(droid)
{
	hackRemoveMessage("C1A_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	queue("runAway", camSecondsToMilliseconds(1));
	queue("doAmbush", camSecondsToMilliseconds(5));
});

// Road between first outpost and base two.
camAreaEvent("roadblockArea", function(droid)
{
	camEnableFactory("base2Factory");
});

// Scavengers hiding in the split canyon area between base two and three.
function raidAttack()
{
	camManageGroup( camMakeGroup("raidTrigger", ENEMIES), CAM_ORDER_ATTACK, {
		pos: camMakePos("scavBase3Cleanup")
	});
	camManageGroup(camMakeGroup("raidGroup", ENEMIES), CAM_ORDER_ATTACK, {
		pos: camMakePos("scavBase3Cleanup")
	});
	camManageGroup(camMakeGroup("raidGroup2", ENEMIES), CAM_ORDER_ATTACK, {
		pos: camMakePos("scavBase3Cleanup")
	});
	camManageGroup(camMakeGroup("scavBase3Cleanup", ENEMIES), CAM_ORDER_DEFEND, {
		pos: camMakePos("scavBase3Cleanup")
	});
	camEnableFactory("base3Factory");
}

// Wait for player to get close to the split canyon and attack, if not already.
camAreaEvent("raidTrigger", function(droid)
{
	camCallOnce("raidAttack");
});

// Or, they built on base two's oil patch instead. Initiate a surprise attack.
function eventStructureBuilt(structure, droid)
{
	if (structure.player === CAM_HUMAN_PLAYER && structure.stattype === RESOURCE_EXTRACTOR)
	{
		// Is it in the base two area?
		var objs = enumArea("scavBase2Cleanup", CAM_HUMAN_PLAYER);
		for (var i = 0, l = objs.length; i < l; ++i)
		{
			var obj = objs[i];
			if (obj.type === STRUCTURE && obj.stattype === RESOURCE_EXTRACTOR)
			{
				camCallOnce("raidAttack");
				break;
			}
		}
	}
}

camAreaEvent("scavBase3Cleanup", function(droid)
{
	camEnableFactory("base4Factory");
});

function camEnemyBaseEliminated_scavGroup1()
{
	camEnableFactory("base2Factory");
}

function camEnemyBaseEliminated_scavGroup2()
{
	queue("camDetectEnemyBase", camSecondsToMilliseconds(2), "scavGroup3");
}

function eventGameInit()
{
	// if completed in eventStartLevel() the sensor range is normal for a split second. Prefer to run this before map is loaded
	// only needed in cam1a and cam1b
	completeResearch("R-Sys-Sensor-Upgrade00", 0);
}

function cam1setup()
{
	enableResearch("R-Wpn-MG1Mk1", 0);
	camCompleteRequiredResearch(CAM1A_RESEARCH, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(CAM1A_RES_SCAV, ULTSCAV);
	camCompleteRequiredResearch(CAM1A_RES_SCAV, SCAVS);

	const BASE_STRUCTURES = [
		"A0CommandCentre", "A0PowerGenerator", "A0ResourceExtractor",
		"A0ResearchFacility", "A0LightFactory",
	];

	for (var i = 0; i < BASE_STRUCTURES.length; ++i)
	{
		enableStructure(BASE_STRUCTURES[i], CAM_HUMAN_PLAYER);
	}
}

function eventStartLevel()
{
	const PLAYER_POWER = 2500;
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CAM_1B");

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	cam1setup()
	setPower(PLAYER_POWER, CAM_HUMAN_PLAYER);
	setAlliance(ULTSCAV, SCAVS, true);

	// Give player briefing.
	hackAddMessage("CMB1_MSG", CAMP_MSG, CAM_HUMAN_PLAYER, false);
	if (difficulty === HARD)
	{
		setMissionTime(camMinutesToSeconds(25));
	}
	else if (difficulty === INSANE)
	{
		setMissionTime(camMinutesToSeconds(20));
	}
	else
	{
		setMissionTime(camMinutesToSeconds(30)); // will start mission timer later
	}

	// Feed libcampaign.js with data to do the rest.
	camSetEnemyBases({
		"scavGroup1": {
			cleanup: "scavBase1Cleanup",
			detectMsg: "C1A_BASE0",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"scavGroup2": {
			cleanup: "scavBase2Cleanup",
			detectMsg: "C1A_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"scavGroup3": {
			cleanup: "scavBase3Cleanup",
			detectMsg: "C1A_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"scavGroup4": {
			cleanup: "scavBase4Cleanup",
			detectMsg: "C1A_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
	});

	camSetArtifacts({
		"base1ArtifactPos": { tech: "R-Wpn-MG-Damage01" },
		"base2Factory": { tech: "R-Wpn-Flamer01Mk1" },
		"base3Factory": { tech: "R-Defense-Tower01" },
		"base4Factory": { tech: "R-Sys-Engineering01" },
	});

	camSetFactories({
		"base2Factory": {
			assembly: "base2Assembly",
			order: CAM_ORDER_ATTACK,
			data: { pos: "playerBase" },
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.trike, cTempl.bloke ]
		},
		"base3Factory": {
			assembly: "base3Assembly",
			order: CAM_ORDER_ATTACK,
			data: { pos: "playerBase" },
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.bloke, cTempl.buggy, cTempl.bloke ]
		},
		"base4Factory": {
			assembly: "base4Assembly",
			order: CAM_ORDER_ATTACK,
			data: { pos: "playerBase" },
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(13)),
			templates: [ cTempl.bjeep, cTempl.bloke, cTempl.trike, cTempl.bloke ]
		},
	});
	ultScav_eventStartLevel(
		-1, // vtols on/off. -1 = off
		140, // build defense every x seconds
		75, // build factories every x seconds
		-1, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		30, // produce droids every x seconds
		-1, // produce cyborgs every x seconds
		-1, // produce VTOLs every x seconds
		3, // min factories
		-1, // min vtol factories
		-1, // min cyborg factories
		3, // min number of trucks
		-1, // min number of sensor droids
		25, // min number of attack droids
		10, // min number of defend droids
		120, // ground attack every x seconds
		-1, // VTOL attack every x seconds
		1); // tech level

	// Delete scav rockets and mortars (cam1a only)
	delete ultScav_templates.rbjeep;
	delete ultScav_templates.rbuggy;
	delete ultScav_defenses.RocketPit;
	delete ultScav_defenses.LancerPit;
	delete ultScav_defenses.MortarPit;
}
