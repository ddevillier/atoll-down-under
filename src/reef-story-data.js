// Optional adventures extend exploration without replacing existing journeys.
export const REEF_STORIES={
 clinic:{id:'reef-clinic',name:'The Reef Clinic',species:['s43','s45'],description:'Open a cleaning station, read your visitors, and welcome a familiar fish back.'},
 artist:{id:'disappearing-artist',name:'The Disappearing Artist',species:['s19'],description:'Choose a background and a pattern. See whether a passing observer notices you.'},
 engineer:{id:'sandcastle-engineer',name:'The Sandcastle Engineer',species:['s15'],description:'Graze different ledges, leave sand behind, and see life return to a rested patch.'},
 detective:{id:'whisker-detective',name:'The Whisker Detective',species:['s9'],description:'Feel for buried meals with your barbels, then decide what to eat and what to share.'},
 nursery:{id:'cardinalfish-nursery',name:'Dad’s Big Mouth',species:['s13'],description:'Find a quiet nursery, brood your young, and watch them settle into shelter.'},
 housekeeper:{id:'coral-housekeeper',name:'Coral Housekeeper',species:['s30'],description:'Choose a dusty coral pocket, clear it at close contact, and inspect the branches you uncover.'},
 lookout:{id:'rabbitfish-lookout',name:'Your Turn to Look',species:['s8','s52'],description:'Take a lookout position with a real companion, then exchange roles and graze.'},
 walker:{id:'frogfish-walk',name:'A Walk Along the Reef',species:['s54'],description:'Choose a short terrain route, plant your fins on footholds, and walk to a lookout.'},
 nest:{id:'gramma-nest',name:'A Little Room Under the Roof',species:['s3'],description:'Take the role of a nesting male, carry algae beneath a ledge, and clear the entrance.'},
 crevice:{id:'triggerfish-crevice',name:'The Just-Right Crevice',species:['s24'],description:'Compare openings, fit into a crevice, and lock and release your dorsal spine.'},
 shade:{id:'squirrelfish-shade',name:'Someone in the Shade',species:['s12'],description:'Follow a sound and posture cue, inspect a hidden neighbor, and choose room to settle.'},
 lantern:{id:'lantern-company',name:'Lantern Company',species:['s53'],description:'Explore an Anomalops katoptron case study: choose a dark-water route and observe schoolmates respond to visible light.'}
};
export const STORY_IDS=Object.values(REEF_STORIES).map(s=>s.id);
export const storyKeysFor=id=>Object.keys(REEF_STORIES).filter(key=>REEF_STORIES[key].species.includes(id));
// Preserve the original first-match default for older callers and saves.
export const storyKeyFor=id=>storyKeysFor(id)[0]||null;
export const storyCompatible=(id,key)=>Object.hasOwn(REEF_STORIES,key)&&REEF_STORIES[key].species.includes(id);

export const STORY_REFLECTIONS={
 clinic:'A familiar face at your clinic. Gentle care helped two visitors, and one came back to greet you.',
 artist:'Three disguises discovered. Matching sand, shade, and mottled rock helped you hide from a passing fish.',
 engineer:'Your grazing left sand behind. Resting a patch let its algae renew, and another fish found a meal.',
 detective:'A discovery worth sharing. Your barbels found a buried meal, and a reef neighbor enjoyed it.',
 nursery:'A quiet nursery for your young. Their father carried the brood in his mouth until they were ready.',
 housekeeper:'You uncovered branches in a dusty coral home. Banded humbugs can help remove sediment from the corals they shelter in.',
 lookout:'One rabbitfish watched while the other grazed, then you exchanged roles. Researchers observed this coordination in both studied rabbitfish species.',
 walker:'Your fins found footholds along the reef. Frogfishes can use their paired fins to walk over the bottom.',
 nest:'As a nesting male, you lined a sheltered corner and cleared its entrance. Royal gramma males prepare and tend nests.',
 crevice:'A fitting crevice held your raised dorsal spine. Clown triggerfish can lock that spine to brace themselves, then release it to leave.',
 shade:'Sound, posture, and spacing helped you notice a neighbor. Squirrelfish sounds need context; they are not words to translate.',
 lantern:'In this Anomalops katoptron case study, visible light helped schoolmates keep contact and turn. Light signals work together with spacing and surroundings.'
};
