
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/ultScav.js");


var artiGroup; //Droids that take the artifact
var enemyHasArtifact; //Do they have the artifact
var enemyStoleArtifact; //Reached the LZ with the artifact
var droidWithArtiID; //The droid ID that was closest to the artifact to take it
var artiMovePos; //where artiGroup members are moving to


//These enable scav factories when close enough
camAreaEvent("northScavFactoryTrigger", function(droid)
{
	camEnableFactory("scavNorthEastFactory");
});

camAreaEvent("southScavFactoryTrigger", function(droid)
{
	camEnableFactory("scavSouthEastFactory");
});

camAreaEvent("middleScavFactoryTrigger", function(droid)
{
	camEnableFactory("scavMiddleFactory");
});

//If a group member of artiGroup gets to the waypoint, then go to the
//New Paradigm landing zone.
camAreaEvent("NPWayPointTrigger", function(droid)
{
	artiMovePos = "NPTransportPos";
});

//Land New Paradigm transport if the New Paradigm have the artifact.
camAreaEvent("NPTransportTrigger", function(droid)
{
	if (enemyHasArtifact && droid.group === artiGroup)
	{
		var list = [cTempl.npmrl, cTempl.npmrl];
		camSendReinforcement(NEW_PARADIGM, camMakePos("NPTransportPos"), list, CAM_REINFORCE_TRANSPORT, {
			entry: { x: 39, y: 2 },
			exit: { x: 32, y: 60 }
		});
		playSound("pcv632.ogg"); //enemy transport escaping warning sound
	}
	else
	{
		resetLabel("NPTransportTrigger", NEW_PARADIGM);
	}
});

//Only called once when the New Paradigm takes the artifact for the first time.
function artifactVideoSetup()
{
	camPlayVideos("SB1_7_MSG3");
	camCallOnce("removeCanyonBlip");
	artiMovePos = "NPWayPoint";
}

//Remove nearby droids. Make sure the player loses if the NP still has the artifact
//by the time it lands.
function eventTransporterLanded(transport)
{
	if (transport.player === NEW_PARADIGM && enemyHasArtifact)
	{
		enemyStoleArtifact = true;
		var crew = enumRange(transport.x, transport.y, 6, NEW_PARADIGM, false).filter(function(obj) {
			return obj.type === DROID && obj.group === artiGroup;
		});
		for (var i = 0, l = crew.length; i < l; ++i)
		{
			camSafeRemoveObject(crew[i], false);
		}
	}
}

//Check if the artifact group members are still alive and drop the artifact if needed.
function eventGroupLoss(obj, group, newsize)
{
	if (group === artiGroup && enemyHasArtifact && !enemyStoleArtifact)
	{
		if (obj.id === droidWithArtiID)
		{
			var acrate = addFeature("Crate", obj.x, obj.y);
			addLabel(acrate, "newArtiLabel");

			camSetArtifacts({
				"newArtiLabel": { tech: "R-Wpn-Cannon3Mk1" }
			});

			droidWithArtiID = undefined;
			enemyHasArtifact = false;
			hackRemoveMessage("C1-7_LZ2", PROX_MSG, CAM_HUMAN_PLAYER);
		}
	}
}

function enemyCanTakeArtifact(label)
{
	return label.indexOf("newArtiLabel") !== -1 || label.indexOf("artifactLocation") !== -1;
}

//Moves some New Paradigm forces to the artifact
function getArtifact()
{
	if (groupSize(artiGroup) === 0)
	{
		return;
	}

	const GRAB_RADIUS = 2;
	var artifact = camGetArtifacts().filter(function(label) {
		return enemyCanTakeArtifact(label) && getObject(label) !== null;
	});
	var artiLoc = artiMovePos;

	if (!enemyHasArtifact && !enemyStoleArtifact && artifact.length > 0)
	{
		//Go to the artifact instead.
		var realCrate = artifact[0];
		artiLoc = camMakePos(realCrate);
		if (!camDef(artiLoc))
		{
			return; //player must have snatched it
		}

		//Find the one closest to the artifact so that one can "hold" it
		var artiMembers = enumGroup(artiGroup);
		var idx = 0;
		var dist = Infinity;

		for (var i = 0, l = artiMembers.length; i < l; ++i)
		{
			var drDist = camDist(artiMembers[i], artiLoc);
			if (drDist < dist)
			{
				idx = i;
				dist = drDist;
			}
		}

		//Now take it if close enough
		if (camDist(artiMembers[idx], artiLoc) < GRAB_RADIUS)
		{
			camCallOnce("artifactVideoSetup");
			hackAddMessage("C1-7_LZ2", PROX_MSG, CAM_HUMAN_PLAYER, true); //NPLZ blip
			droidWithArtiID = artiMembers[idx].id;
			enemyHasArtifact = true;
			camSafeRemoveObject(realCrate, false);
		}
	}

	if (camDef(artiLoc))
	{
		camManageGroup(artiGroup, CAM_ORDER_DEFEND, {
			pos: artiLoc,
			radius: 0,
			regroup: false
		});
	}

	queue("getArtifact", camSecondsToMilliseconds(0.2));
}

//New Paradigm truck builds six lancer hardpoints around LZ
function buildLancers()
{
	for (var i = 1; i <= 6; ++i)
	{
		camQueueBuilding(NEW_PARADIGM, "WallTower06", "hardPoint" + i);
	}
}

//Must destroy all of the New Paradigm droids and make sure the artifact is safe.
function extraVictory()
{
	var npTransportFound = false;
	enumDroid(NEW_PARADIGM).forEach(function(dr) {
		if (camIsTransporter(dr))
		{
			npTransportFound = true;
		}
	});

	//fail if they stole it and the transporter is not on map anymore
	if (enemyStoleArtifact && !npTransportFound)
	{
		return false;
	}

	if (!enumDroid(NEW_PARADIGM).length)
	{
		return true;
	}
}

function removeCanyonBlip()
{
	hackRemoveMessage("C1-7_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
}

function eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT)
	{
		if (droid.player === CAM_HUMAN_PLAYER)
		{
			if (enemyHasArtifact)
			{
				hackRemoveMessage("C1-7_LZ2", PROX_MSG, CAM_HUMAN_PLAYER);
			}
			enemyHasArtifact = false;
			camCallOnce("removeCanyonBlip");
		}
	}
}

//Mission setup stuff
function eventStartLevel()
{
	enemyHasArtifact = false;
	enemyStoleArtifact = false;
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone"); //player lz
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "SUB_1_DS", {
		area: "RTLZ",
		message: "C1-7_LZ",
		reinforcements: camMinutesToSeconds(1),
		callback: "extraVictory",
		retlz: true,
	});

	//Make sure the New Paradigm and Scavs are allies
	setAlliance(NEW_PARADIGM, SCAVS, true);
	setAlliance(NEW_PARADIGM, ULTSCAV, true);
	setAlliance(ULTSCAV, SCAVS, true);

	//Get rid of the already existing crate and replace with another
	camSafeRemoveObject("artifact1", false);
	camSetArtifacts({
		"artifactLocation": { tech: "R-Wpn-Cannon3Mk1" },
	});

	camCompleteRequiredResearch(CAM1_7_RES_NP, NEW_PARADIGM);
	camCompleteRequiredResearch(CAM1_7_RES_SCAV, SCAVS);
	camCompleteRequiredResearch(CAM1_7_RES_SCAV, ULTSCAV);

	camSetEnemyBases({
		"ScavMiddleGroup": {
			cleanup: "scavMiddle",
			detectMsg: "C1-7_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"ScavSouthEastGroup": {
			cleanup: "scavSouthEast",
			detectMsg: "C1-7_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"ScavNorthEastGroup": {
			cleanup: "scavNorth",
			detectMsg: "C1-7_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
	});

	camSetFactories({
		"scavMiddleFactory": {
			assembly: "middleAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ]
		},
		"scavSouthEastFactory": {
			assembly: "southAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ]
		},
		"scavNorthEastFactory": {
			assembly: "northAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			rdata: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ]
		},
	});

	artiGroup = camMakeGroup(enumArea("NPArtiGroup", NEW_PARADIGM, false));
	droidWithArtiID = 0;
	camManageTrucks(NEW_PARADIGM);
	buildLancers();

	hackAddMessage("C1-7_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, true); //Canyon
	queue("getArtifact", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
	ultScav_eventStartLevel(
		1, // vtols on/off. -1 = off
		55, // build defense every x seconds
		45, // build factories every x seconds
		-1, // build cyborg factories every x seconds
		20, // produce trucks every x seconds
		65, // produce droids every x seconds
		-1, // produce cyborgs every x seconds
		35, // produce VTOLs every x seconds
		2, // min factories
		4, // min vtol factories
		-1, // min cyborg factories
		3, // min number of trucks
		2, // min number of sensor droids
		10, // min number of attack droids
		3, // min number of defend droids
		135, // ground attack every x seconds
		230, // VTOL attack every x seconds
		1); // tech level
}
