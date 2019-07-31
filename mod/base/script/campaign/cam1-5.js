
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/ultScav.js");


//Get some droids for the New Paradigm transport
function getDroidsForNPLZ(args)
{
	var scouts = [ cTempl.npsens, cTempl.nppod, cTempl.nphmg ];
	var heavies = [ cTempl.npsbb, cTempl.npmmct, cTempl.npmrl ];

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

//These enable Scav and NP factories when close enough
camAreaEvent("NorthScavFactoryTrigger", function(droid)
{
	camEnableFactory("ScavNorthFactory");
	camEnableFactory("NPCyborgFactory");
	camEnableFactory("NPLeftFactory");
	camEnableFactory("NPRightFactory");
});

camAreaEvent("SouthWestScavFactoryTrigger", function(droid)
{
	camEnableFactory("ScavSouthWestFactory");
});

camAreaEvent("SouthEastScavFactoryTrigger", function(droid)
{
	camEnableFactory("ScavSouthEastFactory");
});

camAreaEvent("NPFactoryTrigger", function(droid)
{
	if (camIsTransporter(droid) === false)
	{
		camEnableFactory("NPCyborgFactory");
		camEnableFactory("NPLeftFactory");
		camEnableFactory("NPRightFactory");
	}
	else
	{
		resetLabel("NPFactoryTrigger", CAM_HUMAN_PLAYER);
	}
});

//Land New Paradigm transport in the LZ area (protected by four hardpoints in the New Paradigm base)
camAreaEvent("NPLZTrigger", function()
{
	sendNPTransport();
});

function sendNPTransport()
{
	var tPos = getObject("NPTransportPos");
	var nearbyDefense = enumRange(tPos.x, tPos.y, 6, NEW_PARADIGM, false);

	if (nearbyDefense.length)
	{
		var list = getDroidsForNPLZ();
		camSendReinforcement(NEW_PARADIGM, camMakePos("NPTransportPos"), list, CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 42 },
			exit: { x: 2, y: 42 },
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: true,
				count: -1,
				pos: camMakePos("NPBase"),
				repair: 66,
			},
		});

		queue("sendNPTransport", camChangeOnDiff(camMinutesToMilliseconds(3)));
	}
}

function enableNPFactories()
{
	camEnableFactory("NPCyborgFactory");
	camEnableFactory("NPLeftFactory");
	camEnableFactory("NPRightFactory");
}

//Destroying the New Paradigm base will activate all scav factories
//And make any unfound scavs attack the player
function camEnemyBaseEliminated_NPBaseGroup()
{
	//Enable all scav factories
	camEnableFactory("ScavNorthFactory");
	camEnableFactory("ScavSouthWestFactory");
	camEnableFactory("ScavSouthEastFactory");

	//All SCAVS on map attack
	camManageGroup(
		camMakeGroup(enumArea(0, 0, mapWidth, mapHeight, SCAVS, false)),
		CAM_ORDER_ATTACK
	);
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CAM_1A-C", {
		area: "RTLZ",
		message: "C1-5_LZ",
		reinforcements: camMinutesToSeconds(2),
		annihilate: true
	});

	var lz = getObject("LandingZone1"); //player lz
	var lz2 = getObject("LandingZone2"); //new paradigm lz
	var tent = getObject("TransporterEntry");
	var text = getObject("TransporterExit");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setNoGoArea(lz2.x, lz2.y, lz2.x2, lz2.y2, NEW_PARADIGM);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	//Transporter is the only droid of the player's on the map
	var transporter = enumDroid();
	cameraTrack(transporter[0]);

	//Make sure the New Paradigm and Scavs are allies
	setAlliance(NEW_PARADIGM, SCAVS, true);
	setAlliance(NEW_PARADIGM, ULTSCAV, true);
	setAlliance(ULTSCAV, SCAVS, true);

	camCompleteRequiredResearch(CAM1_5_RES_NP, NEW_PARADIGM);
	camCompleteRequiredResearch(CAM1_5_RES_SCAV, SCAVS);
	camCompleteRequiredResearch(CAM1_5_RES_SCAV, ULTSCAV);

	camSetEnemyBases({
		"ScavNorthGroup": {
			cleanup: "ScavNorth",
			detectMsg: "C1-5_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"ScavSouthWestGroup": {
			cleanup: "ScavSouthWest",
			detectMsg: "C1-5_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"ScavSouthEastGroup": {
			cleanup: "ScavSouthEast",
			detectMsg: "C1-5_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"NPBaseGroup": {
			cleanup: "NPBase",
			detectMsg: "C1-5_OBJ1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
			player: NEW_PARADIGM
		},
	});

	camSetArtifacts({
		"NPCyborgFactory": { tech: "R-Struc-Factory-Cyborg" },
		"NPRightFactory": { tech: "R-Vehicle-Engine02" },
		"NPLeftFactory": { tech: "R-Vehicle-Body08" }, //scorpion body
		"NPResearchFacility": { tech: "R-Comp-SynapticLink" },
		"MRAemplacement": { tech: "R-Wpn-Rocket-Range01" },
		"Sunburst": { tech: "R-Wpn-Sunburst" },
	});

	camSetFactories({
		"NPLeftFactory": {
			assembly: "NPLeftAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.npmrl, cTempl.npmmct, cTempl.npsbb, cTempl.nphmg ],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
		},
		"NPRightFactory": {
			assembly: "NPRightAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			templates: [ cTempl.npmor, cTempl.npsens, cTempl.npsbb, cTempl.nphmg ],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
		},
		"NPCyborgFactory": {
			assembly: "NPCyborgAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			templates: [ cTempl.npcybc, cTempl.npcybf, cTempl.npcybm ],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
		},
		"ScavSouthWestFactory": {
			assembly: "ScavSouthWestAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ],
			data: {
				regroup: false,
				count: -1,
			},
		},
		"ScavSouthEastFactory": {
			assembly: "ScavSouthEastAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ],
			data: {
				regroup: false,
				count: -1,
			},
		},
		"ScavNorthFactory": {
			assembly: "ScavNorthAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ],
			data: {
				regroup: false,
				count: -1,
			},
		},
	});

	queue("enableNPFactories", camChangeOnDiff(camMinutesToMilliseconds(10)));
	ultScav_eventStartLevel(
		1, // vtols on/off. -1 = off
		85, // build defense every x seconds
		75, // build factories every x seconds
		-1, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		30, // produce droids every x seconds
		-1, // produce cyborgs every x seconds
		40, // produce VTOLs every x seconds
		4, // min factories
		2, // min vtol factories
		-1, // min cyborg factories
		4, // min number of trucks
		2, // min number of sensor droids
		20, // min number of attack droids
		10, // min number of defend droids
		55, // ground attack every x seconds
		170, // VTOL attack every x seconds
		1); // tech level
}
