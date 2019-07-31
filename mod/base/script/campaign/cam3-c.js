include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include ("script/campaign/ultScav.js");

const GAMMA = 1; //Gamma is player one.

var reunited;

camAreaEvent("gammaBaseTrigger", function(droid) {
	discoverGammaBase();
});

function setupPatrolGroups()
{
	camManageGroup(camMakeGroup("NEgroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southBaseRetreat"),
			camMakePos("southOfVtolBase"),
			camMakePos("SWrampToGammaBase"),
			camMakePos("eastRidgeGammaBase"),
		],
		//fallback: camMakePos("southBaseRetreat"),
		//morale: 90,
		interval: camSecondsToMilliseconds(35),
		regroup: true,
	});

	camManageGroup(camMakeGroup("Egroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southBaseRetreat"),
			camMakePos("southOfVtolBase"),
			camMakePos("SWrampToGammaBase"),
			camMakePos("eastRidgeGammaBase"),
		],
		//fallback: camMakePos("southBaseRetreat"),
		//morale: 90,
		interval: camSecondsToMilliseconds(35),
		regroup: true,
	});

	camManageGroup(camMakeGroup("vtolGroup1"), CAM_ORDER_ATTACK, {
		regroup: false, count: -1
	});

	camManageGroup(camMakeGroup("vtolGroup2"), CAM_ORDER_ATTACK, {
		regroup: false, count: -1
	});
}

//Either time based or triggered by discovering Gamma base.
function enableAllFactories()
{
	camEnableFactory("NXbase1HeavyFacArti");
	camEnableFactory("NXsouthCybFac");
	camEnableFactory("NXcybFacArti");
	camEnableFactory("NXvtolFacArti");
}

function discoverGammaBase()
{
	reunited = true;
	var lz = getObject("landingZone");
	setScrollLimits(0, 0, 64, 192); //top and middle portion.
	restoreLimboMissionData();
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(90)));
	setPower(playerPower(CAM_HUMAN_PLAYER) + camChangeOnDiff(10000));

	playSound("power-transferred.ogg");
	playSound("pcv616.ogg"); //Group rescued.

	camAbsorbPlayer(GAMMA, CAM_HUMAN_PLAYER); //Take everything they got!
	setAlliance(NEXUS, GAMMA, false);
	setAlliance(ULTSCAV, GAMMA, false);

	hackRemoveMessage("CM3C_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER);
	hackRemoveMessage("CM3C_BETATEAM", PROX_MSG, CAM_HUMAN_PLAYER);

	enableAllFactories();
}

function betaAlive()
{
	if (reunited)
	{
		return true; //Don't need to see if Beta is still alive if reunited with base.
	}

	const BETA_DROID_IDS = [536, 1305, 1306, 1307, 540, 541,];
	var alive = false;
	var myDroids = enumDroid(CAM_HUMAN_PLAYER);

	for (var i = 0, l = BETA_DROID_IDS.length; i < l; ++i)
	{
		for (var x = 0, c = myDroids.length; x < c; ++x)
		{
			if (myDroids[x].id === BETA_DROID_IDS[i])
			{
				alive = true;
				break;
			}
		}

		if (alive)
		{
			break;
		}
	}

	if (!alive)
	{
		return false;
	}
}

function eventStartLevel()
{
	var startpos = getObject("startPosition");
	var limboLZ = getObject("limboDroidLZ");
	reunited = false;

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CAM3A-D1", {
		callback: "betaAlive"
	});

	centreView(startpos.x, startpos.y);
	setNoGoArea(limboLZ.x, limboLZ.y, limboLZ.x2, limboLZ.y2, -1);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(10)));

	var enemyLz = getObject("NXlandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, NEXUS);

	camCompleteRequiredResearch(CAM3C_RES_NEXUS, NEXUS);
	camCompleteRequiredResearch(CAM3C_RES_ALLY, GAMMA);
	hackAddMessage("CM3C_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER, true);
	hackAddMessage("CM3C_BETATEAM", PROX_MSG, CAM_HUMAN_PLAYER, true);

	setAlliance(CAM_HUMAN_PLAYER, GAMMA, true);
	setAlliance(NEXUS, GAMMA, true);
	setAlliance(ULTSCAV, GAMMA, true);
	setAlliance(ULTSCAV, NEXUS, true);

	camSetArtifacts({
		"NXbase1HeavyFacArti": { tech: "R-Wpn-Laser02" }, 
		"NXcybFacArti": { tech: "R-Wpn-RailGun01" },
		"NXvtolFacArti": { tech: "R-Struc-Factory-Upgrade07" },
		"NXcommandCenter": { tech: "R-Wpn-Missile-LtSAM" },
	}); 

	camSetEnemyBases({
		"NXNorthBase": {
			cleanup: "northBaseCleanup",
			detectMsg: "CM3C_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NXVtolBase": {
			cleanup: "vtolBaseCleanup",
			detectMsg: "CM3C_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NXSouthBase": {
			cleanup: "southBaseCleanup",
			detectMsg: "CM3C_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"NXbase1HeavyFacArti": {
			assembly: "NXHeavyAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: false,
				repair: 45,
				count: -1,
			},
			templates: [cTempl.nxmrailh, cTempl.nxlflash, cTempl.nxmlinkh] //nxmsamh
		},
		"NXsouthCybFac": {
			assembly: "NXsouthCybFacAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas]
		},
		"NXcybFacArti": {
			assembly: "NXcybFacArtiAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas]
		},
		"NXvtolFacArti": {
			assembly: "NXvtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.nxmheapv, cTempl.nxmtherv]
		},
	});

	camPlayVideos(["MB3_C_MSG", "MB3_C_MSG2"]);
	setScrollLimits(0, 137, 64, 192); //Show the middle section of the map.
	changePlayerColour(GAMMA, 0);

	queue("setupPatrolGroups", camSecondsToMilliseconds(10));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));
	ultScav_eventStartLevel(
		-1, // vtols on/off. -1 = off
		50, // build defense every x seconds
		50, // build factories every x seconds
		45, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		35, // produce droids every x seconds
		60, // produce cyborgs every x seconds
		-1, // produce VTOLs every x seconds
		2, // min factories
		-1, // min vtol factories
		2, // min cyborg factories
		5, // min number of trucks
		3, // min number of sensor droids
		20, // min number of attack droids
		10, // min number of defend droids
		135, // ground attack every x seconds
		-1, // VTOL attack every x seconds
		4); // tech level
}
