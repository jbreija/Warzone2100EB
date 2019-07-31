include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include ("script/campaign/ultScav.js");

const UPLINK = 1; //The satellite uplink player number.

camAreaEvent("vtolRemoveZone", function(droid)
{
	if ((droid.player === THE_COLLECTIVE) && isVTOL(droid))
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("vtolRemoveZone");
});

//Order the truck to build some defenses.
function truckDefense()
{
	if (enumDroid(THE_COLLECTIVE, DROID_CONSTRUCT).length > 0)
	{
		queue("truckDefense", camSecondsToMilliseconds(160));
	}

	var list = ["AASite-QuadBof", "WallTower04", "GuardTower-RotMg", "WallTower-Projector"];
	camQueueBuilding(THE_COLLECTIVE, list[camRand(list.length)], camMakePos("uplinkPos"));
}

//Attacks every 2 minutes until HQ is destroyed.
function vtolAttack()
{
	var list = [cTempl.colatv];
	camSetVtolData(THE_COLLECTIVE, "vtolAppearPos", "vtolRemovePos", list, camChangeOnDiff(camMinutesToMilliseconds(2)), "COCommandCenter");
}

//The project captured the uplink.
function captureUplink()
{
	const GOODSND = "pcv621.ogg";	//"Objective captured"
	playSound(GOODSND);
	hackRemoveMessage("C2D_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
}

//Extra win condition callback.
function checkNASDACentral()
{
	if (getObject("uplink") === null)
	{
		return false; //It was destroyed
	}

	if (camCountStructuresInArea("uplinkClearArea", THE_COLLECTIVE) === 0)
	{
		camCallOnce("captureUplink");
		return true;
	}
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "SUB_2_6S", {
		area: "RTLZ",
		message: "C2D_LZ",
		reinforcements: camMinutesToSeconds(3),
		callback: "checkNASDACentral",
		annihilate: true,
		retlz: true
	});

	var startpos = getObject("startPosition");
	var lz = getObject("landingZone"); //player lz
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);
	setAlliance(THE_COLLECTIVE, ULTSCAV, true);
	
	var enemyLz = getObject("COLandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, THE_COLLECTIVE);

	camSetArtifacts({
		"COCommandCenter": { tech: "R-Struc-VTOLPad-Upgrade01" },
		"COResearchLab": { tech: "R-Struc-Research-Upgrade05" },
		"COCommandRelay": { tech: "R-Wpn-Bomb02" },
		"COHeavyFactory": { tech: "R-Wpn-Howitzer-Accuracy01" },
		"ScavFact": { tech: "R-Wpn-Missile2A-T" },
	});

	setAlliance(CAM_HUMAN_PLAYER, UPLINK, true);
	setAlliance(THE_COLLECTIVE, UPLINK, true);
	setAlliance(7, UPLINK, true);
	setAlliance(7, THE_COLLECTIVE, true);

	camCompleteRequiredResearch(CAM2D_RES_COL, THE_COLLECTIVE);

	camSetEnemyBases({
		"COSouthEastBase": {
			cleanup: "baseCleanup",
			detectMsg: "C2D_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"COHeavyFactory": {
			assembly: "COHeavyFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [cTempl.cohhpv, cTempl.comhltat, cTempl.cohct]
		},
		"COSouthCyborgFactory": {
			assembly: "COSouthCyborgFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.npcybc, cTempl.npcybf, cTempl.npcybr, cTempl.cocybag]
		},
	});

	camManageTrucks(THE_COLLECTIVE);
	truckDefense();
	hackAddMessage("C2D_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, true);

	camEnableFactory("COHeavyFactory");
	camEnableFactory("COSouthCyborgFactory");

	queue("vtolAttack", camMinutesToMilliseconds(2));
	ultScav_eventStartLevel(
		-1, // vtols on/off. -1 = off
		30, // build defense every x seconds
		50, // build factories every x seconds
		45, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		55, // produce droids every x seconds
		35, // produce cyborgs every x seconds
		-1, // produce VTOLs every x seconds
		2, // min factories
		-1, // min vtol factories
		3, // min cyborg factories
		5, // min number of trucks
		3, // min number of sensor droids
		20, // min number of attack droids
		10, // min number of defend droids
		135, // ground attack every x seconds
		-1, // VTOL attack every x seconds
		2.5); // tech level
}
