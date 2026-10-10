// Optional adventures extend exploration without replacing existing journeys.
export const REEF_STORIES={
 clinic:{id:'reef-clinic',name:'The Reef Clinic',species:['s43','s45'],description:'Open a cleaning station, read your visitors, and welcome a familiar fish back.'},
 artist:{id:'disappearing-artist',name:'The Disappearing Artist',species:['s19'],description:'Choose a background and a pattern. See whether a passing observer notices you.'},
 engineer:{id:'sandcastle-engineer',name:'The Sandcastle Engineer',species:['s15'],description:'Graze different ledges, leave sand behind, and see life return to a rested patch.'},
 detective:{id:'whisker-detective',name:'The Whisker Detective',species:['s9'],description:'Feel for buried meals with your barbels, then decide what to eat and what to share.'},
 nursery:{id:'cardinalfish-nursery',name:'Dad’s Big Mouth',species:['s13'],description:'Find a quiet nursery, brood your young, and watch them settle into shelter.'}
};
export const STORY_IDS=Object.values(REEF_STORIES).map(s=>s.id);
export const storyKeyFor=id=>Object.keys(REEF_STORIES).find(key=>REEF_STORIES[key].species.includes(id))||null;

export const STORY_REFLECTIONS={
 clinic:'A familiar face at your clinic. Gentle care helped two visitors, and one came back to greet you.',
 artist:'Three disguises discovered. Matching sand, shade, and mottled rock helped you hide from a passing fish.',
 engineer:'Your grazing left sand behind. Resting a patch let its algae renew, and another fish found a meal.',
 detective:'A discovery worth sharing. Your barbels found a buried meal, and a reef neighbor enjoyed it.',
 nursery:'A quiet nursery for your young. Their father carried the brood in his mouth until they were ready.'
};
