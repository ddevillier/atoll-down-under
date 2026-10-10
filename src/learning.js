import {SPECIES,FOODS} from './data.js';
import {suitableMeal} from './diet.js';

// The diagram describes the simulation. Natural-history text below has separate sources.
export function foodWeb(species){
 return {
  resources:Object.entries(FOODS).filter(([food])=>suitableMeal(species,{kind:'food',food})).map(([id,f])=>({id,...f})),
  prey:SPECIES.filter(s=>s.id!==species.id&&suitableMeal(species,s)),
  predators:SPECIES.filter(s=>s.id!==species.id&&suitableMeal(s,species)),
  special:species.diet.filter(food=>!FOODS[food]&&!SPECIES.some(s=>s.food===food))
 };
}

export const REEF_LESSONS=[
 {id:'coral',title:'A reef made by animals',food:'coral',
  body:'A coral polyp is an animal. Its tentacles capture food from the water. Many hard corals live in colonies: their limestone skeletons accumulate as generations grow, helping build the structure of a reef.',
  detail:'Many corals also shelter microscopic algae within their tissues. The algae use light to make food through photosynthesis, and share some of those products with the coral. This partnership helps explain why sunlight matters to many reef-building corals.',
  question:'Look at a coral colony and a swimming fish. What makes both of them animals, even though only one swims around?',
  model:'The game presents coral polyps as renewable food for selected fish. It does not simulate coral growth or the algae living inside coral.',
  source:'NOAA Ocean Service — Are corals animals or plants?',url:'https://oceanservice.noaa.gov/facts/coral.html'},
 {id:'plankton',title:'Small drifters, large connections',food:'plankton',
  body:'Plankton are organisms carried along by currents. The name describes a way of life, not one species. Some remain drifters throughout life; others are the young of animals that will later swim more strongly.',
  detail:'Photosynthetic phytoplankton use sunlight, while zooplankton include animals. Feeding links can connect phytoplankton to zooplankton and then to larger animals. A tiny food source can therefore be part of many different food chains.',
  question:'Find two creatures that eat plankton. Do their bodies look alike? Follow each creature through the food web.',
  model:'The drifting specks stand for one combined plankton food type. The model does not distinguish phytoplankton, zooplankton, or larval stages.',
  source:'NOAA Ocean Service — What are plankton?',url:'https://oceanservice.noaa.gov/facts/plankton.html'},
 {id:'sponge',title:'An animal that filters water',food:'sponge',
  body:'A sponge is an animal, even though it stays attached to a surface and may look like a plant. Water passes through its porous body, bringing oxygen and tiny food particles such as bacteria.',
  detail:'Sponges and corals have different body structures and feeding methods. Sponges help process material moving through reef water. Their shapes and colors vary widely, so shape alone is not enough to decide whether something is a plant or an animal.',
  question:'Compare a sponge, coral, and algae. Which makes food using light? Which obtains food from other organisms?',
  model:'The game groups many kinds of sponge into a single food type. Its food-acceptance and poison rules are simplified and should not be generalized to every real species.',
  source:'NOAA Ocean Service — What is a sponge?',url:'https://oceanservice.noaa.gov/facts/sponge.html'},
 {id:'grazing',title:'Grazing changes a reef',food:'algae',
  body:'Reef herbivores such as surgeonfishes and parrotfishes eat algae. Their feeding can limit algal growth and help maintain space where corals can settle and grow.',
  detail:'Different grazers remove different amounts and kinds of algae. Understanding a food web means asking what feeding changes in the community, as well as asking which animal eats which food.',
  question:'Observe a grazer feeding, then compare its diet with a fish-eating hunter. What would change if the grazers were absent?',
  model:'Grazers consume renewable food patches here. Long-term competition between algae and coral is not simulated, so use the question to reason about the real reef rather than as a prediction from this model.',
  source:'NOAA Fisheries — Restoring natural grazing processes can help coral reefs',url:'https://www.fisheries.noaa.gov/feature-story/restoring-natural-grazing-processes-can-help-coral-reefs'}
];
