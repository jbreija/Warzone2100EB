include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/ultScav.js");

var index; //Number of bonus transports that have flown in.
var startedFromMenu;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("vtolRemoveZone", NEXUS);
});

//Order base three groups to do stuff.
camAreaEvent("cybAttackers", function(droid)
{
	enableAllFactories();

	camManageGroup(camMakeGroup("NEAttackerGroup"), CAM_ORDER_ATTACK, {
		regroup: true,
		morale: 90,
		fallback: camMakePos("SWBaseRetreat")
	});

	camManageGroup(camMakeGroup("NEDefenderGroup"), CAM_ORDER_DEFEND, {
		pos: [
			camMakePos("genericasAssembly"),
			camMakePos("northFacAssembly"),
		],
		regroup: true,
	});
});

camAreaEvent("westFactoryTrigger", function(droid)
{
	enableAllFactories();
});

//make the first batch or extra transport droids hero rank.
function setHeroUnits()
{
	const DROID_EXP = 512;
	var droids = enumDroid(CAM_HUMAN_PLAYER).filter(function(dr) {
		return (!camIsSystemDroid(dr) && !camIsTransporter(dr));
	});

	for (var j = 0, i = droids.length; j < i; ++j)
	{
		setDroidExperience(droids[j], DROID_EXP);
	}
}

function eventTransporterLanded(transport)
{
	if (startedFromMenu)
	{
		camCallOnce("setHeroUnits");
	}
}

//Enable all factories.
function enableAllFactories()
{
	const FACTORY_NAMES = [
		"NXcybFac-b3", "NXcybFac-b2-1", "NXcybFac-b2-2", "NXHvyFac-b2", "NXcybFac-b4",
	];

	for (var j = 0, i = FACTORY_NAMES.length; j < i; ++j)
	{
		camEnableFactory(FACTORY_NAMES[j]);
	}
}


//Extra transport units are only awarded to those who start Gamma campaign
//from the main menu.
function sendPlayerTransporter()
{
	const transportLimit = 4; //Max of four transport loads if starting from menu.
	if (!camDef(index))
	{
		index = 0;
	}

	if (index === transportLimit)
	{
		return;
	}

	var droids = [];
	var list = [cTempl.prhasgnt, cTempl.prhhpvt, cTempl.prhaacnt, cTempl.prtruck];

	// send 4 Assault Guns, 2 Hyper Velocity Cannons, 2 Cyclone AA Turrets and 2 Trucks
	for (var i = 0, d = list.length; i < 10; ++i)
	{
		droids.push(i < d * 2 ? list[i % 4] : list[0]);
	}

	camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 63, y: 118 },
			exit: { x: 63, y: 118 }
		}
	);

	index = index + 1;
	queue("sendPlayerTransporter", camMinutesToMilliseconds(5));
}

//Setup Nexus VTOL hit and runners.
function vtolAttack()
{
	var list = [cTempl.nxlneedv, cTempl.nxlscouv, cTempl.nxmtherv];
	camSetVtolData(NEXUS, "vtolAppearPos", "vtolRemovePos", list, camChangeOnDiff(camMinutesToMilliseconds(5)), "NXCommandCenter");
}

//These groups are active immediately.
function groupPatrolNoTrigger()
{
	camManageGroup(camMakeGroup("cybAttackers"), CAM_ORDER_ATTACK, {
		pos: [
			camMakePos("northFacAssembly"),
			camMakePos("ambushPlayerPos"),
		],
		regroup: true,
		count: -1,
		morale: 90,
		fallback: camMakePos("healthRetreatPos")
	});

	camManageGroup(camMakeGroup("hoverPatrolGrp"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverGrpPos1"),
			camMakePos("hoverGrpPos2"),
			camMakePos("hoverGrpPos3"),
		]
	});

	camManageGroup(camMakeGroup("cybValleyPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southWestBasePatrol"),
			camMakePos("westEntrancePatrol"),
			camMakePos("playerLZPatrol"),
		]
	});

	camManageGroup(camMakeGroup("NAmbushCyborgs"), CAM_ORDER_ATTACK);
}

//Build defenses.
function truckDefense()
{
	if (enumDroid(NEXUS, DROID_CONSTRUCT).length > 0)
	{
		queue("truckDefense", camSecondsToMilliseconds(160));
	}

	const DEFENSE = ["NX-Tower-Rail1", "NX-Tower-ATMiss"];
	camQueueBuilding(NEXUS, DEFENSE[camRand(DEFENSE.length)]);
}

//Gives starting tech and research.
function cam3Setup()
{
	var x = 0;
	var l = 0;

	camCompleteRequiredResearch(CAM1A_RESEARCH, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(CAM1A_RESEARCH, NEXUS);
	camCompleteRequiredResearch(CAM2A_RESEARCH, ultScav_PLAYER_NUM);

	camCompleteRequiredResearch(CAM2A_RESEARCH, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(CAM2A_RESEARCH, NEXUS);
	camCompleteRequiredResearch(CAM2A_RESEARCH, ultScav_PLAYER_NUM);

	camCompleteRequiredResearch(CAM3A_RESEARCH, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(CAM3A_RESEARCH, NEXUS);
	camCompleteRequiredResearch(CAM3A_RESEARCH, ultScav_PLAYER_NUM);
	camCompleteRequiredResearch(CAM3A_RES_NEXUS, NEXUS);

		const STRUCTS = [
			"A0CommandCentre", "A0PowerGenerator", "A0ResourceExtractor",
			"A0ResearchFacility", "A0LightFactory",
		];
	
		for (var i = 0; i < STRUCTS.length; ++i)
		{
			enableStructure(STRUCTS[i], CAM_HUMAN_PLAYER);
		}

}


function eventStartLevel()
{
	const PLAYER_POWER = 16000;
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone");
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "SUB_3_1S");
	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));

	setAlliance(3, 7, true);
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	var enemyLz = getObject("NXlandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, NEXUS);

	camSetArtifacts({
		"NXPowerGenArti": { tech: "R-Struc-Power-Upgrade02" },
		"NXResearchLabArti": { tech: "R-Sys-Engineering03" },
	});

	setPower(PLAYER_POWER, CAM_HUMAN_PLAYER);
	cam3Setup();
	setAlliance(3, 7, true);
	
	camSetEnemyBases({
		"NEXUS-WBase": {
			cleanup: "westBaseCleanup",
			detectMsg: "CM3A_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NEXUS-SWBase": {
			cleanup: "southWestBaseCleanup",
			detectMsg: "CM3A_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NEXUS-NEBase": {
			cleanup: "northEastBaseCleanup",
			detectMsg: "CM3A_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NEXUS-NWBase": {
			cleanup: "northWestBaseCleanup",
			detectMsg: "CM3A_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"NXcybFac-b3": {
			assembly: "NXcybFac-b3Assembly",
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			group: camMakeGroup("NEAttackerGroup"),
			templates: [cTempl.nxcyrail, cTempl.nxcyscou]
		},
		"NXcybFac-b2-1": {
			assembly: "NXcybFac-b2-1Assembly",
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			group: camMakeGroup("cybAttackers"),
			templates: [cTempl.nxcyrail, cTempl.nxcyscou]
		},
		"NXcybFac-b2-2": {
			assembly: "NXcybFac-b2-2Assembly",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("southWestBasePatrol"),
					camMakePos("westEntrancePatrol"),
					camMakePos("playerLZPatrol"),
				],
				regroup: false,
				repair: 40,
				count: -1,
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			group: camMakeGroup("cybValleyPatrol"),
			templates: [cTempl.nxcyrail, cTempl.nxcyscou]
		},
		"NXHvyFac-b2": {
			assembly: "NXHvyFac-b2Assembly",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("hoverGrpPos1"),
					camMakePos("hoverGrpPos2"),
					camMakePos("hoverGrpPos3"),
				],
				regroup: false,
				repair: 45,
				count: -1,
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			group: camMakeGroup("hoverPatrolGrp"),
			templates: [cTempl.nxmscouh]
		},
		"NXcybFac-b4": {
			assembly: "NXcybFac-b4Assembly",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("genericasAssembly"),
					camMakePos("northFacAssembly"),
				],
				regroup: false,
				repair: 40,
				count: -1,
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			group: camMakeGroup("NEDefenderGroup"),
			templates: [cTempl.nxcyrail, cTempl.nxcyscou]
		},
	});

	camManageTrucks(NEXUS);
	truckDefense();
	camPlayVideos(["MB3A_MSG", "MB3A_MSG2"]);
	startedFromMenu = false;

	//Only if starting Gamma directly rather than going through Beta
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_TRANSPORTER).length === 0)
	{
		startedFromMenu = true;
		setReinforcementTime(LZ_COMPROMISED_TIME);
		sendPlayerTransporter();
	}
	else
	{
		setReinforcementTime(camMinutesToSeconds(5));
	}

	groupPatrolNoTrigger();
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(20)));
	ultScav_eventStartLevel(
		1, // vtols on/off. -1 = off
		20, // build defense every x seconds
		50, // build factories every x seconds
		45, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		35, // produce droids every x seconds
		25, // produce cyborgs every x seconds
		40, // produce VTOLs every x seconds
		5, // min factories
		5, // min vtol factories
		5, // min cyborg factories
		10, // min number of trucks
		3, // min number of sensor droids
		10, // min number of attack droids
		3, // min number of defend droids
		135, // ground attack every x seconds
		135, // VTOL attack every x seconds
		3); // tech level
}
