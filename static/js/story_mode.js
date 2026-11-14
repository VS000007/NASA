/**
 * Space Archaeologists - Voice Storytelling Room & Hero Story Engine
 * Implements:
 *  - Default Female Voice Synthesis with prioritized female voice detection (Zira, Jenny, Aria, Samantha, etc.)
 *  - Narrator Voice Gender Switcher (Female Explorer Dr. Elena / Male Flight Director Dave)
 *  - 5-Beat Narrative Arc for every hero mission (Launch, Journey, Challenge, Discovery, Legacy)
 *  - 5 Perspectives: The Robot, The Engineer, The Scientist, Mission Control, Future Explorer
 *  - 3 Age Bands: Cadet (6-8), Explorer (9-11), Commander (12-14) with rich, sensory, and age-tailored narratives
 *  - Interactive Mission Audio Soundboard (Rocket Blastoff, Martian Wind, Morning Wake-up Song, Laser Zap, Airbag Boing)
 *  - Interactive Beat Decision Challenge with immediate telemetry feedback & sound effects
 *  - Secret Mission Dossier & Artifact File flip drawer for each beat
 *  - Click-to-Speak Read-Along Teleprompter with real-time sentence karaoke highlighting
 */

class StoryModeController {
  constructor() {
    this.modal = null;
    this.currentHeroId = 'opportunity';
    this.currentBeatIndex = 0;
    this.currentPerspective = 'robot'; // 'robot', 'engineer', 'scientist', 'mission_control', 'explorer'
    this.currentAgeBand = 'cadet'; // 'cadet', 'explorer', 'commander'
    this.narratorGender = 'female'; // Default to warm, natural female voice
    this.speechRate = 1.0;
    this.isPlayingVoice = false;
    this.synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.audioContext = null;
    this.ambientSoundNode = null;
    this.ambientEnabled = true;
    this.activeVoiceObj = null;

    this.heroStories = {
      'opportunity': {
        name: 'Opportunity Rover (MER-B)',
        callsign: 'Oppy',
        body: 'Mars',
        year: 2004,
        site: 'Meridiani Planum to Endeavour Crater',
        model_file: '/models/opportunity_rover.glb',
        image: 'https://images-assets.nasa.gov/image/PIA16239/PIA16239~orig.jpg',
        beats: [
          {
            title: 'Beat 1: The Launch & 90-Sol Dream',
            subtitle: 'Built for 3 months, destined for 15 years',
            challenge: {
              prompt: 'Pre-Flight Dilemma: Martian dust will slowly coat the solar wings. How should we keep Oppy powered?',
              options: [
                {
                  text: 'A) Add heavy mechanical wipers and spray bottles to wash the glass',
                  correct: false,
                  feedback: 'Too heavy! Wipers would add 15 kg of weight, and spray liquid would freeze solid in -130°C Martian nights. Engineers chose a lighter, bolder solution!'
                },
                {
                  text: 'B) Design lightweight tilted arrays and rely on natural Martian cleaning winds',
                  correct: true,
                  feedback: 'Brilliant choice! Natural Martian dust devils unexpectedly swept Oppy\'s solar arrays clean over 40 times, extending her 90-day mission into a 15-year odyssey!'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: 9/11 World Trade Center Memorial Shield',
              secretFact: 'Bolted to Opportunity\'s rock abrasion tool is a special aluminum cable shield machined from recovered structural steel of the World Trade Center towers, honoring the victims as an eternal memorial on Mars.',
              telemetry: 'Delta II 7925H Liftoff • Speed: 25,000 mph • Cruise Distance: 283,000,000 miles • Target Margin: ±15 km'
            },
            robot: {
              cadet: "Beep-boop! My adventure started in a bustling laboratory in sunny California! Friendly engineers wearing puffy white bunny suits polished my shiny gold solar wings and tested my six knobby wheels. Everyone smiled and whispered: 'Go get 'em, little rover—see if you can roll for 90 magical days on Mars!' My metal heart thumped with excitement as the giant Delta II rocket ignited with a deafening WHOOSH into the starry night!",
              explorer: "On July 7, 2003, a Delta II Heavy rocket blasted off from Cape Canaveral, shooting me across 283 million miles of deep space. My creators at NASA's Jet Propulsion Laboratory built me to survive just 90 Martian days (sols). They equipped me with microscopic cameras, spectrometers, and a diamond-tipped rock grinder, tasking me with the ultimate detective quest: uncover whether liquid water once flowed across the mysterious red sands of Mars.",
              commander: "Opportunity (MER-B) was engineered at NASA JPL as a 185-kg solar-powered geological field scout. Mission requirements stipulated a 90-sol design envelope and a 600-meter traverse threshold. The spacecraft integrated a high-gain steerable mast with Pancam stereoscopic optics, Miniature Thermal Emission Spectrometer (Mini-TES), Alpha Particle X-Ray Spectrometer (APXS), and a 140-watt triple-junction GaAs solar array."
            },
            engineer: {
              cadet: "We packed twin rovers into the noses of giant rockets! We folded Oppy's wheels like an origami puzzle and cushioned her with bouncy airbags. We held our breath, watched the countdown reach zero, and cheered as fire lit up the ocean coast!",
              explorer: "Every gram was calculated. We engineered a rocker-bogie suspension system that could crawl over rocks bigger than its wheels without tipping over. But we worried constantly: if Martian dust covered her solar panels after 90 days, her electric heaters would starve and freeze. We had to move fast.",
              commander: "The thermal-power margin dictated strict operational limits. Under late-spring Meridiani insolation, the GaAs array produced approximately 900 watt-hours per sol. Decay models forecasted that atmospheric dust settling would degrade solar flux below survival thresholds by Sol 100, necessitating rapid early-traverse execution."
            },
            scientist: {
              cadet: "We pointed giant telescopes at Mars and spotted a huge gray patch. We wondered: could that be an ancient sea? Did alien fish or friendly microbes once splash in Martian waves? We sent Oppy to find out!",
              explorer: "Orbital spectrometers on the Mars Global Surveyor detected crystalline hematite across Meridiani Planum. On Earth, hematite almost always forms in standing liquid water or hot thermal springs. Eagle Crater was chosen as our bullseye to investigate whether Mars had once been warm and hospitable.",
              commander: "Selection of the Meridiani Planum landing ellipse (lat -1.98°, lon 354.06°E) was driven by MGS TES 9-micron absorption bands identifying coarse-grained crystalline gray hematite. The primary science objective was resolving whether the hematite signature originated from lacustrine deposition or volcanic hydrothermal precipitation."
            },
            mission_control: {
              cadet: "In the control room, hundreds of computer screens glowed green. We counted down together: Three! Two! One! LIFTOFF! Papers flew into the air, people hugged, and our journey to the Red Planet began!",
              explorer: "Liftoff was at 03:18 UTC from Pad 17B. For seven long months across interplanetary space, our flight controllers tracked every radio pulse, steering Opportunity through four delicate trajectory maneuvers across the solar system toward Mars.",
              commander: "Trajectory correction maneuvers TCM-1 through TCM-4 executed with less than 0.08% velocity residual variance. Deep Space Network stations at Goldstone, Madrid, and Canberra maintained continuous telemetry lock, validating optimal atmospheric entry angles."
            },
            explorer: {
              cadet: "If you visit a space museum one day, look at the blueprints of this little rover. She set off across the starry sky before smartphones, iPads, or modern internet even existed!",
              explorer: "Looking back at launch day, you realize Opportunity carried the curiosity of our entire civilization. She wasn't just a machine; she was humanity's eyes and hands reaching across 280 million miles of cosmos.",
              commander: "Historical retrospectives identify the 2003 Mars Exploration Rover campaign as the pivotal transition from orbital remote sensing to rigorous field geology, inaugurating continuous 21st-century surface exploration of Mars."
            }
          },
          {
            title: 'Beat 2: The Bouncing Landing & The Hole-in-One',
            subtitle: 'A 240-million-mile golf shot into Eagle Crater',
            challenge: {
              prompt: 'EDL Descent Thriller: You are falling at 12,000 mph through Mars atmosphere! How do you survive touchdown?',
              options: [
                {
                  text: 'A) Deploy 24 giant pressurized airbags and bounce across the surface',
                  correct: true,
                  feedback: 'Interplanetary Hole-in-One! The airbags bounced 30 feet high, bounced 30 times, and rolled right into the center of Eagle Crater, landing right in front of exposed bedrock!'
                },
                {
                  text: 'B) Fire reverse thrusters all the way until wheels touch the ground',
                  correct: false,
                  feedback: 'Danger! Rocket exhaust at close range would kick up abrasive dust into the cameras and risked flipping the rover. Airbags absorbed 18G of impact energy safely!'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: Bouncing Airbag Petal Markings',
              secretFact: 'When the airbags deflated and the triangular lander petals opened like a flower, the rover looked outside and saw its own landing bounce tracks imprinted into the red Martian soil just 5 feet away.',
              telemetry: 'Entry Velocity: 12,000 mph • Peak G-Force: 18G • Rebound Bounces: 30 • Touchdown Site: Eagle Crater (22m diameter)'
            },
            robot: {
              cadet: "WHOA! Hold onto your astronaut helmets! I plunged into Mars's thin sky at 12,000 miles per hour! Suddenly, my parachute opened with a loud SNAP! Then, 24 giant bouncy bubble-balloons wrapped around me like a cosmic bouncy house! BOING! BOING! BOING! I bounced 30 times across the red dirt until I rolled to a gentle stop inside a crater. A hole-in-one on Mars!",
              explorer: "On January 25, 2004, I endured the 'Six Minutes of Terror'. Encased in 24 pressurized Kevlar airbags, I slammed into Meridiani Planum, rebounding 30 feet into the air across 30 bounces. When the airbags deflated and my petal doors unfolded, my cameras peered out: I had rolled into a 72-foot crater and stopped right in front of a white wall of exposed bedrock!",
              commander: "Entry, Descent, and Landing (EDL) engaged a 10.7-meter disk-gap-band parachute, radar altimeter telemetry, transverse impulse rocket firing (TIRS), and tetrahedral airbag attenuation. The lander came to rest in the 22-meter depression of Eagle Crater, oriented at an 8-degree incline directly facing layered sedimentary outcrop."
            },
            engineer: {
              cadet: "The radio went completely silent during the bounces. We gripped the tables until—BEEP! Carrier signal locked! Oppy was alive, unhurt, and standing proud on Mars!",
              explorer: "The radar altimeter cut the bridal cables 40 feet above the ground. For ten agonizing minutes we heard nothing. Then the telemetry carrier locked: petals opened, solar panels deployed to 100%, and the internal cameras were undamaged. It was an engineering miracle.",
              commander: "Post-landing reconstruction verified peak deceleration of 18.2 Gs. Pyrotechnic gas generators in the 24-lobe airbag assembly retained 100% envelope integrity. Petal retraction actuators successfully leveled the rover on Sol 1 without requiring high-torque tilt recovery."
            },
            scientist: {
              cadet: "We looked at the first pictures and jumped out of our chairs! Rovers usually land in boring flat dirt, but Oppy rolled right up to a wall of secret rock layers! Mars was handing us its ancient diary on day one!",
              explorer: "Geologists dream their entire lives of finding an exposed rock outcrop. Mars delivered one right to Oppy's front bumper. We called it an interplanetary hole-in-one—a 240-million-mile shot that landed squarely in the bullseye.",
              commander: "Eagle Crater's interior exposed pristine sulfate-rich bedrock stratigraphy without requiring kilometers of hazardous traverse across dune fields. The outcrop presented millimeter-scale lamina, enabling immediate micro-textural and chemical investigation."
            },
            mission_control: {
              cadet: "Green lights flashed everywhere on the big screen! 'Touchdown confirmed!' People threw papers in the air, laughed, cried, and danced around the room!",
              explorer: "Flight Director announced: 'Opportunity has touched down on Mars.' We cued the mission wake-up song: 'Straight to the Moon' by The Flaming Lips. Mars exploration was rewritten that night.",
              commander: "Deep Space Network Madrid station locked on the 8.4 GHz X-band low-gain antenna at 05:05 UTC. Signal-to-noise margins demonstrated optimal omnidirectional transmitter health with nominal bus voltages."
            },
            explorer: {
              cadet: "If you walk through the dust of Eagle Crater today, you can still spot the soft little dents where Oppy's airbags bounced over 20 years ago!",
              explorer: "Eagle Crater is only 72 feet across. To hit that exact spot from Earth is like a golfer teeing off in New York and sinking a hole-in-one in Paris.",
              commander: "Eagle Crater stands as an unprecedented triumph of autonomous ballistic targeting, marking the exact coordinates where robotic paleolacustrine geology began."
            }
          },
          {
            title: 'Beat 3: Blueberries & The Ancient Salty Lake',
            subtitle: 'Microscopic discoveries that proved Mars had water',
            challenge: {
              prompt: 'Geological Discovery: You spot thousands of tiny gray spheres in the dust! How do you prove they formed in water?',
              options: [
                {
                  text: 'A) Drill into rock with the RAT tool and analyze hematite crystals with spectrometers',
                  correct: true,
                  feedback: 'Confirmed! The Rock Abrasion Tool revealed millimeter hematite spheres (nicknamed "blueberries") grown inside jarosite mineral beds that could only crystallize in liquid water!'
                },
                {
                  text: 'B) Roll over them with rover wheels to see if they squish like fruit',
                  correct: false,
                  feedback: 'They are solid stone! Rover wheels would crush the fragile crystal structures without revealing their chemical composition. Grinding and spectroscopy proved the case!'
                }
              ]
            },
            dossier: {
              title: 'Scientific Spec: The "Blueberry" Hematite Concretions',
              secretFact: 'These spheres are not blue—they are metallic gray hematite marbles only 1 to 4 millimeters across. Because they appeared blue in false-color contrast images, the science team affectionately dubbed them Martian blueberries.',
              telemetry: 'Target: "El Capitan" Outcrop • Mineral: Jarosite (KFe3(SO4)2(OH)6) • Hematite Content: >50% • Water Evidence: Definitive'
            },
            robot: {
              cadet: "I zoomed in my magnifying robot eye onto the dirt... and gasped! The ground was sprinkled with billions of tiny, shiny gray marbles that looked just like blueberries! But they weren't fruit—they were magic mineral beads created inside warm, salty waves of water billions of years ago. Mars was once splashing with lakes!",
              explorer: "Using my Microscopic Imager and Mössbauer Spectrometer, I analyzed the outcrop named 'El Capitan'. The rocks were packed with jarosite—a sulfate mineral that only forms in acidic liquid water. And embedded throughout were billions of tiny hematite spheres we nicknamed 'blueberries', formed as minerals crystallized inside an ancient lakebed.",
              commander: "Deploying the Mössbauer Spectrometer and APXS against the 'El Capitan' rock facies resolved high sulfate concentrations dominated by jarosite (KFe₃(SO₄)₂(OH)₆). Millimeter-scale spherical hematite concretions ('blueberries') exhibited uniform distribution and lack of sorting, proving secondary diagenetic growth within a saturated groundwater table."
            },
            engineer: {
              cadet: "We built a tiny rock grinder on her robot arm called the RAT! It had real diamond teeth that spun super fast to carve shiny circular windows into alien rocks!",
              explorer: "Our Rock Abrasion Tool (RAT) used diamond-tipped grinding pads to grind 5 millimeters into rock faces. Watching the telemetry stream confirming that the grinder had carved clean circles into Martian bedrock was an unforgettable triumph.",
              commander: "RAT grinding head actuators executed controlled milling cycles with closed-loop current sensing, ensuring sample surfaces were stripped of atmospheric dust rind without fracturing sub-surface sulfate strata."
            },
            scientist: {
              cadet: "Water! Mars had real liquid water you could splash in! It was salty and warm billions of years ago. Our little robot just rewrote all the science books in the world!",
              explorer: "We discovered cross-bedding festoon patterns in the sediment—the unmistakable rippling geometry created by gentle water waves flowing across a shallow lakebed. Mars was not a dead desert forever; it had been an active, splashing water world.",
              commander: "Sedimentological analysis identified low-angle cross-stratification and festoon cross-bedding characteristic of aqueous subaqueous ripples in a playa lake environment, establishing definitive evidence of prolonged surface habitability."
            },
            mission_control: {
              cadet: "We called a giant worldwide press conference! Scientists smiled from ear to ear and told the world: 'Mars was once soaking wet!'",
              explorer: "On March 23, 2004, NASA convened a historic press briefing. We announced that liquid water had once drenched the plains of Meridiani Planum. Opportunity had fulfilled its primary mission goal in less than two months.",
              commander: "Peer-reviewed findings published in Science documented that the primary mission charter was fulfilled by Sol 60, well within the 90-sol design lifespan. Tactical teams commenced extended mission planning."
            },
            explorer: {
              cadet: "When future human astronauts walk on Mars, they will bend down and pick up those little gray marbles. Those blueberries are memories from an ancient alien ocean!",
              explorer: "Billions of hematite blueberries still coat the plains of Meridiani Planum. They are nature's eternal monument to a wet, splashing Martian past.",
              commander: "The Meridiani blueberries remain an irreplaceable extraterrestrial paleohydrological record, preserved for 3.7 billion years in a hyper-arid planetary deep freeze."
            }
          },
          {
            title: 'Beat 4: The 28-Mile Marathon & The Sand Traps',
            subtitle: 'Surviving 5,000 Martian sunrises and driving across craters',
            challenge: {
              prompt: 'Sand Trap Emergency: Oppy\'s wheels are buried to the axles in soft Purgatory Dune! How do you escape?',
              options: [
                {
                  text: 'A) Spin all wheels at full power forward to muscle through the sand',
                  correct: false,
                  feedback: 'Danger! Full power forward causes 100% wheel slip, digging the rover belly-deep into soft sand until it is permanently stuck. Patience and physics saved Oppy!'
                },
                {
                  text: 'B) Build a duplicate sand box in California to test gentle reverse maneuvers',
                  correct: true,
                  feedback: 'Heroic engineering! Engineers spent 5 weeks testing wheel motions in a sandbox in Pasadena, California, steering Oppy backward centimeter by centimeter to freedom!'
                }
              ]
            },
            dossier: {
              title: 'Mission Logbook: The 26.2-Mile Off-World Marathon',
              secretFact: 'On March 24, 2015, Opportunity reached 26.219 miles (42.195 km) of total driving—completing the first official marathon on another planet. NASA JPL engineers celebrated by running a marathon in California!',
              telemetry: 'Total Distance: 28.06 miles (45.16 km) • Operational Sols: 5,111 (Planned: 90) • Craters Explored: Eagle, Endurance, Victoria, Endeavour'
            },
            robot: {
              cadet: "My 90 days ran out, but I wasn't sleepy yet! Whenever dust covered my solar wings, Martian wind devils whooshed past and brushed me clean! I rolled across giant sand dunes and deep canyon cliffs, driving over 28 whole miles. That's farther than an Olympic marathon on alien ground!",
              explorer: "Over 14 years, I trekked across the Red Planet. Unexpected wind gusts blew dust off my solar panels, recharging my batteries. I drove 28.06 miles (45.16 km)—setting the off-world driving record for any vehicle in human history as I explored giant craters like Victoria and Endeavour.",
              commander: "Enabled by recurring atmospheric cleaning events, my operational lifespan expanded from 90 to 5,111 sols. Traversing from Eagle through Endurance and Victoria to Endeavour Crater, the odometer recorded 45.16 kilometers, establishing the extraterrestrial traverse benchmark across extreme regolith terrains."
            },
            engineer: {
              cadet: "Her front right wheel got stuck in a soft sand dune! We built a big sandbox in California with fake sand to test how to wiggle her out. After five weeks of wiggling, she popped out safely!",
              explorer: "In 2005, Oppy became bogged down in 'Purgatory Dune' with wheel sinkage past the rims. For five weeks, we simulated the dune in the JPL sandbox, calculating slip angles and steering geometry until we reversed her out millimeters at a time.",
              commander: "Wheel slip reached 100% in Purgatory Dune. Tactical engineers authored dedicated visual odometry and slip-monitoring algorithms that evaluated ground frame shifts between drive segments, preventing rover stranding across 14 years of operations."
            },
            scientist: {
              cadet: "She found a giant shiny meteor that fell from outer space onto Mars! The very first meteorite ever discovered on another planet!",
              explorer: "At Endurance Crater, Oppy discovered 'Heat Shield Rock'—an iron-nickel meteorite that had plummeted from deep space. At Endeavour Crater, she surveyed smectite clays that proved neutral, drinkable water had once existed on Mars.",
              commander: "Discovery of 'Heat Shield Rock' marked the first meteorite identified on another world. Subsequent investigations along Endeavour Crater's rim (Cape York) detected phyllosilicates, signaling non-acidic, near-neutral pH aqueous environments conducive to pre-biotic chemistry."
            },
            mission_control: {
              cadet: "Every single morning for 14 years, our team sent Oppy a good morning wake-up song: Beatles, Queen, and Star Wars music beamed right across the cosmos!",
              explorer: "Generations of engineers grew up on the Opportunity mission. People joined as interns, got married, and raised children while Opportunity was still rolling across Mars. She became family to thousands of space lovers worldwide.",
              commander: "Over 5,000 tactical command uplink cycles were executed across Deep Space Network 70-meter parabolic dishes. Telemetry integrity maintained near-zero loss over 15 continuous years of mission execution."
            },
            explorer: {
              cadet: "Her tire tracks stretch across Mars for miles and miles, like a golden path drawn through red sand dunes under the starry night.",
              explorer: "No human has ever walked a marathon on another planet. A courageous solar-powered robot did it first, rolling peacefully beneath alien stars.",
              commander: "Opportunity's 45.16-kilometer traverse track remains an indelible archaeological monument to 21st-century robotic mobility and human perseverance."
            }
          },
          {
            title: 'Beat 5: The Darkness, Silence & Eternal Legacy',
            subtitle: 'Perseverance Valley and the last song from Earth',
            challenge: {
              prompt: 'The Monster 2018 Dust Storm: Atmospheric dust opacity reaches tau 10.8 (total blackness). How does Oppy respond?',
              options: [
                {
                  text: 'A) Transmit high-power emergency distress radio calls non-stop',
                  correct: false,
                  feedback: 'Battery drain! High-power radio would exhaust the remaining 22 watt-hours of battery in less than two hours. Oppy needed power to keep her survival clock heaters warm!'
                },
                {
                  text: 'B) Power down all non-essential science systems and enter deep low-power sleep',
                  correct: true,
                  feedback: 'The noble, correct procedure! Oppy turned off her science instruments, tucked in her arm, and put herself into deep sleep to protect her internal electronics from freezing.'
                }
              ]
            },
            dossier: {
              title: 'Final Mission Telemetry: Sol 5111 at Perseverance Valley',
              secretFact: 'Opportunity\'s final telemetry packet sent on June 10, 2018 translates philosophically to the famous phrase: "My battery is low and it\'s getting dark." On February 12, 2019, JPL beamed Billie Holiday\'s "I\'ll Be Seeing You" as the final goodnight song.',
              telemetry: 'Location: Perseverance Valley (-2.335°N, 354.65°E) • Final Solar Power: 22 Wh • Atmospheric Tau: 10.8 • Status: Silent Sentinel'
            },
            robot: {
              cadet: "One afternoon, the sky turned dark orange, then pitch black. A monster dust storm swept across Mars, blocking every ray of sunshine. My battery began to get very chilly. I tucked in my robot arm, sent a final sweet goodnight beep to Earth, and curled up for a peaceful nap in Perseverance Valley. I'm resting now, waiting for human friends to come visit me.",
              explorer: "In June 2018, a planet-encircling dust storm blotted out the Sun. On Sol 5,111, my solar output fell to just 22 watt-hours. My final telemetry transmitted back to Pasadena told the world: 'My battery is low and it's getting dark.' In the quiet beauty of Perseverance Valley, I powered down and fell into a peaceful sleep.",
              commander: "Atmospheric optical depth (tau) escalated beyond 10.8 in June 2018, cutting solar array insolation below the critical survival heater threshold of 24 watt-hours. Opportunity executed emergency low-power sleep protocols on Sol 5,111, remaining stationary on the upper slopes of Perseverance Valley."
            },
            engineer: {
              cadet: "We called her radio for eight months: 'Oppy, wake up! We are here!' We never gave up until the very last whisper.",
              explorer: "For 240 days, we beamed over a thousand recovery signals across the DSN. On February 12, 2019, we played our final song: 'I'll Be Seeing You' by Billie Holiday. Mars remained silent. We wiped our tears and celebrated 15 glorious years.",
              commander: "Following 833 active recovery sweeps via Deep Space Network and orbital UHF passes by Mars Reconnaissance Orbiter, NASA formally concluded the MER mission on February 13, 2019, concluding 14 years and 11 months of active exploration."
            },
            scientist: {
              cadet: "She showed us Mars was alive with water. She is a brave pioneer who taught humanity how to explore the universe!",
              explorer: "Opportunity changed planetary science forever. She proved that Mars was once a wet, habitable world. Every rover that rolls across Mars today—Curiosity and Perseverance—stands on her shoulders.",
              commander: "Opportunity elevated comparative planetology into a rigorous field discipline. Her findings established definitive geochemical and sedimentological benchmarks that inform current astrobiological exploration across Mars."
            },
            mission_control: {
              cadet: "People in the control room cried and hugged. We were sad she was sleeping, but so wonderfully proud of what she did for all of humanity.",
              explorer: "Project Manager John Callas spoke with tears in his eyes: 'To the rover that did, to the team that made it happen: mission complete. Well done.' The room gave a standing ovation that echoed across JPL.",
              commander: "Mission sign-off was officially executed at JPL Mission Control at 19:00 PST. Operations logged 5,111 sols, 217,594 raw images downlinked, and 100% mission goal fulfillment."
            },
            explorer: {
              cadet: "One day, astronaut boots will crunch through the dust of Perseverance Valley. Someone will wipe the sand off her camera eye and whisper: 'Thank you, Oppy. You showed us the way home.'",
              explorer: "Opportunity rests in Perseverance Valley, looking down over Endeavour Crater. She is not lost. She is waiting quietly for the first human explorers she guided to Mars.",
              commander: "A future Martian heritage sanctuary will preserve Opportunity in-situ—an eternal golden compass marking the dawn of humanity's multi-planetary epoch."
            }
          }
        ]
      },

      'apollo11': {
        name: 'Apollo 11 Descent Stage & EASEP',
        callsign: 'Eagle',
        body: 'Moon',
        year: 1969,
        site: 'Mare Tranquillitatis (Tranquility Base)',
        model_file: '/models/apollo_lunar_module.glb',
        image: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~orig.jpg',
        beats: [
          {
            title: 'Beat 1: The Promise to the Moon',
            subtitle: 'Eight years from Kennedy’s challenge to the launchpad',
            challenge: {
              prompt: 'Weight Engineering Challenge: Every extra pound requires 3 pounds of rocket fuel. What radical choice did engineers make?',
              options: [
                {
                  text: 'A) Removed heavy astronaut seats so astronauts stood up during descent',
                  correct: true,
                  feedback: 'True aerospace genius! Eliminating heavy seats and heavy windows saved 400 kg. Astronauts stood up strapped to shock cables, giving them better visibility out triangular windows!'
                },
                {
                  text: 'B) Replaced metal fuel tanks with plastic water bottles',
                  correct: false,
                  feedback: 'Hypergolic fuels like Aerozine 50 dissolve plastic instantly and require high-pressure titanium tanks! Engineers saved weight by making the cabin walls as thin as 3 sheets of aluminum foil.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: The Silicon Goodwill Disc',
              secretFact: 'Left behind at Tranquility Base is a 1.5-inch silicon disc etched with microscopically reduced messages of peace from 73 world leaders, Presidents Eisenhower, Kennedy, Johnson, and Nixon.',
              telemetry: 'Saturn V Height: 363 ft • Liftoff Thrust: 7,500,000 lbs • Trans-Lunar Injection: 24,200 mph • Transit Time: 73 hours'
            },
            robot: {
              cadet: "Look at me—I have four giant shiny golden legs and a rocket engine in my tummy! President Kennedy made a giant promise to the world, and my job was to carry brave astronauts Neil and Buzz all the way to the dusty Moon. A skyscraper rocket named Saturn V lifted me into the sky with 7.5 million pounds of fire!",
              explorer: "In May 1961, President Kennedy pledged that the United States would land a man on the Moon and return him safely to Earth before the decade was out. On July 16, 1969, Lunar Module LM-5 'Eagle' stood atop a 363-foot Saturn V rocket on Pad 39A, ready to carry humanity off its home world.",
              commander: "Fabricated by Grumman Aerospace in Bethpage, New York, the Apollo Lunar Module was humanity's first dedicated extraterrestrial spacecraft. Operating strictly in the lunar vacuum, LM-5 possessed a structural mass of 15,103 kg, utilizing thin-gage 2024 aluminum alloy skin and 25 layers of aluminized Kapton thermal blanket insulation."
            },
            engineer: {
              cadet: "We made the spacecraft walls as thin as three sheets of kitchen aluminum foil to save weight! You could almost poke a pencil through it, but it was strong enough to keep astronauts breathing in space!",
              explorer: "Every single ounce was audited. We eliminated seats, replaced glass windows with triangular optical polymer panes, and insulated the descent engine with Mylar blankets. The Descent Propulsion System had to throttle from 10% to 60% power—the first variable-thrust rocket engine ever built.",
              commander: "The Descent Propulsion System (DPS) utilized hypergolic aerozine-50 and nitrogen tetroxide propellants delivering 43.9 kN peak thrust. Throttle control operated via cavitating venturi flow regulation, providing the precise throttle modulation essential for final hovering descent."
            },
            scientist: {
              cadet: "What was the Moon made of? Was it green cheese? Would the spaceship sink into a giant ocean of soft powder? Nobody on Earth knew until we touched it!",
              explorer: "Scientists debated fiercely whether the lunar maria were covered in deep seas of quicksand-like dust that would swallow a landing spacecraft. We needed real lunar rocks to date the age of the Moon and test how planets were formed 4.5 billion years ago.",
              commander: "Primary scientific objectives centered on collecting pristine regolith and basalt samples from Mare Tranquillitatis to test planetary accretion models, calibrate crater-counting chronologies, and determine whether the Moon formed from a giant impact."
            },
            mission_control: {
              cadet: "Houston, we are go for launch! The ground shook for miles around, rattles rattled in the windows, and the giant Saturn V rocket roared into space!",
              explorer: "On July 16, 1969, 7.5 million pounds of thrust shook Cape Kennedy. Flight Director Gene Kranz checked every console: 'FIDO, GUIDO, RETRO, TELMU—you are GO for TLI.' Apollo 11 shot out of Earth orbit toward the Moon at 24,000 miles per hour.",
              commander: "Translunar Injection (TLI) burn executed by the S-IVB third stage with zero delta-v variance, injecting Apollo 11 into a free-return trajectory. CSM Columbia and LM Eagle docked and transposed nominally during translunar coast."
            },
            explorer: {
              cadet: "Tranquility Base is the most famous camping spot in the entire universe! The golden stage was built to be their home away from home.",
              explorer: "When you gaze up at the Moon tonight, the dark gray patch on the right is the Sea of Tranquility. That is where humanity first left footprints on another celestial world.",
              commander: "Tranquility Base represents the geopolitical and engineering apex of the 20th century—an unprecedented technological leap achieved in just eight years."
            }
          },
          {
            title: 'Beat 2: The 25-Second Touchdown & Alarm 1202',
            subtitle: 'Computer overload and dodging boulders in West Crater',
            challenge: {
              prompt: 'Descent Alarm 1202: The guidance computer is sounding alarm beeps and West Crater boulders loom below! What does Neil do?',
              options: [
                {
                  text: 'A) Abort the mission immediately and blast back to lunar orbit',
                  correct: false,
                  feedback: 'Margaret Hamilton\'s software priority design kept the computer running vital guidance cycles despite the radar overload, allowing mission control to declare: "We\'re GO on that alarm!"'
                },
                {
                  text: 'B) Take manual attitude control (P66) and fly over the boulder field to flat ground',
                  correct: true,
                  feedback: 'Legendary flying! Neil Armstrong took manual joystick control, tilted Eagle forward, flew past West Crater boulders, and set down smoothly with only 25 seconds of fuel remaining!'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: Lunar Contact Sensing Probes',
              secretFact: 'Hanging 5.6 feet below three of Eagle\'s footpads were thin blue wire probes. When a probe touched lunar soil, a blue light flashed in the cockpit labeled "LUNAR CONTACT", telling Neil to cut the rocket engine before touchdown.',
              telemetry: 'Touchdown Time: 20:17:40 UTC • Remaining Fuel: ~25 seconds • Touchdown Velocity: 1.5 ft/s vertical • Coordinates: 0.67408° N, 23.47297° E'
            },
            robot: {
              cadet: "BEEP! BEEP! BEEP! Red alert! The computer screen started blinking warning numbers: 1202! Neil looked out the little triangular window and saw huge, sharp car-sized rocks waiting to crush us! He grabbed the joystick with both hands, steered past the boulders, and touched down just as the last drop of fuel was about to run out. Phew!",
              explorer: "During final descent, the Apollo Guidance Computer sounded continuous 1202 and 1201 program alarms. Looking out his window, Neil realized the computer was guiding Eagle directly into West Crater—a pit filled with car-sized boulders! Neil took manual control (P66), hovered over the boulders, and touched down smoothly with only 25 seconds of descent fuel left.",
              commander: "At 1,000 meters altitude, rendezvous radar cycle-stealing triggered 1202/1201 executive CPU overflow alarms. Software lead Margaret Hamilton's asynchronous priority scheduling maintained essential thruster control. Armstrong initiated manual attitude hold (P66), translating 300 meters downrange past West Crater ejecta to touch down at 20:17:40 UTC."
            },
            engineer: {
              cadet: "In the control room, flight controllers watched the fuel gauge drop: 60 seconds of fuel left... 30 seconds... 20 seconds! We held our breath so tight we turned blue!",
              explorer: "Descent propellant low-level sensor tripped at 100 feet altitude. CapCom Charlie Duke read the timer down. Neil hovered horizontally searching for smooth dirt. At 25 seconds of usable propellant remaining, the blue contact light flashed on!",
              commander: "Post-flight propellant accounting established that approximately 45 seconds of usable DPS propellant remained before mandatory abort staging. Touchdown velocities were 0.5 m/s vertical and 0.4 m/s lateral, well within landing gear stroking allowances."
            },
            scientist: {
              cadet: "Rocket engines blew sheets of lunar dust away like golden sparklers! Because there is no air on the Moon, dust doesn't billow into clouds—it flies in straight lines!",
              explorer: "Rocket exhaust blasted the top layer of regolith outward in radial sheets of light. The landing footpads sank only two inches into the fine lunar soil. The surface was solid and firm—the spacecraft would not sink into quicksand!",
              commander: "Soil mechanical properties confirmed regolith cohesion of 0.1 to 1.0 kPa with friction angle of 35 to 45 degrees, disproving deep-dust sinkage hypotheses and validating Surveyor automated soil mechanics data."
            },
            mission_control: {
              cadet: "'Houston, Tranquility Base here. The Eagle has landed!' Charlie Duke yelled back: 'Roger, Tranquility! We copy you on the ground. You got a bunch of guys about to turn blue. We\\'re breathing again. Thanks a lot!'",
              explorer: "That transmission from Tranquility Base was heard by 650 million people. Gene Kranz pounded his console: 'Lock the doors, nobody leaves, we\\'ve got men on the Moon!'",
              commander: "Deep Space Network telemetry confirmed contact probe closure and DPS cutoff at 20:17:40 UTC. System pressures, battery bus voltages, and cabin oxygen regulators stabilized nominally."
            },
            explorer: {
              cadet: "That golden stage sat down so gently that the thin ladder didn't even bend! It became the foundation of our first campsite beyond Earth.",
              explorer: "Tranquility Base sits at 0.67408° N, 23.47297° E on Mare Tranquillitatis. For over 57 years, no wind, rain, or storm has disturbed a single grain of dust around those four golden pads.",
              commander: "Tranquility Base marks the exact physical locus where humanity severed its continuous biological confinement to Earth."
            }
          },
          {
            title: 'Beat 3: Footprints & The Scientific Mirror',
            subtitle: 'Leaving behind a laser reflector that works to this day',
            challenge: {
              prompt: 'Active Science on the Moon: What Apollo 11 instrument still beams scientific data back to Earth today without any batteries?',
              options: [
                {
                  text: 'A) The Laser Ranging Retroreflector (LRRR) mirror array',
                  correct: true,
                  feedback: '100% Correct! 100 fused silica corner-cube prisms reflect green laser pulses from Earth telescopes back with millimeter accuracy, measuring Moon distance for 55+ years!'
                },
                {
                  text: 'B) A solar-powered FM radio antenna broadcasting Beatles songs',
                  correct: false,
                  feedback: 'No FM radio was left behind! The scientific payload was the EASEP package: a passive seismometer and the battery-free laser reflector array.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: Apollo 11 Commemorative Plaque',
              secretFact: 'Bolted to the front strut of the golden descent stage between the ladder rungs is a stainless steel plaque signed by Neil Armstrong, Buzz Aldrin, Michael Collins, and Richard Nixon: "Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind."',
              telemetry: 'Prisms: 100 quartz corner-cubes • Precision: ±1 millimeter • Earth-Moon Recession: 3.82 cm/year • Operational Lifespan: 55+ years (Still Active)'
            },
            robot: {
              cadet: "CRUNCH! Buzz Aldrin set foot in the soft lunar dust, leaving the most famous footprints in history! Then he opened a shiny golden suitcase and placed a special glass mirror panel on the Moon. Even right now, scientists on Earth shoot bright green lasers at that exact mirror, and it bounces light right back to Earth!",
              explorer: "Before re-entering the cabin, Neil and Buzz deployed the Early Apollo Scientific Experiments Package (EASEP). It included a seismometer to listen for moonquakes and the Laser Ranging Retroreflector (LRRR)—a panel of 100 quartz corner-cube prisms that reflects laser beams back to Earth without requiring any electricity!",
              commander: "The Apollo 11 EASEP array deployed the Passive Seismic Experiment Package (PSEP) and the Laser Ranging Retroreflector (LRRR). Composed of 100 fused-silica retroreflecting corner cubes, the LRRR operates as a completely passive optical target with zero electrical power degradation."
            },
            engineer: {
              cadet: "Each glass cube inside the panel bounces light straight back to where it came from, even if the light hits at a weird angle! It is like a magic mirror for scientists!",
              explorer: "We precision-machined the corner-cube prisms so incoming light undergoes three internal total reflections and exits 180 degrees back toward the laser source on Earth. After 55 years of wild 300-degree lunar temperature swings, the prisms still function flawlessly.",
              commander: "Suprasil fused-silica prisms were fabricated with wavefront distortion tolerances under 0.2 arcseconds, resisting 55 years of thermal expansion cycling between 100 Kelvin lunar night and 390 Kelvin lunar day."
            },
            scientist: {
              cadet: "By timing how many seconds it takes for a laser beam to bounce off the Moon and come back, we proved the Moon is slowly creeping away from Earth by 1.5 inches every year!",
              explorer: "Telescopes at McDonald Observatory in Texas and Côte d'Azur in France fire pulsed laser beams at Tranquility Base. By measuring the round-trip travel time to picoseconds, we measure the distance between Earth and the Moon down to millimeter accuracy!",
              commander: "Lunar Laser Ranging (LLR) verified the Weak Equivalence Principle of General Relativity to 1 part in 10¹⁴ and established the lunar orbital recession rate of 3.82 ± 0.07 cm/year attributable to ocean tidal dissipation."
            },
            mission_control: {
              cadet: "We watched on black-and-white televisions as Neil climbed down the ladder: 'That\\'s one small step for man, one giant leap for mankind.' 650 million people cheered together!",
              explorer: "650 million people watched the grainy broadcast live. Neil unveiled the stainless steel plaque on the forward landing leg: 'Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind.'",
              commander: "Tranquility Base EVA duration totaled 2 hours, 31 minutes, and 40 seconds. 21.55 kg of pristine lunar rock and core tube samples were successfully secured in Apollo rock boxes."
            },
            explorer: {
              cadet: "The shiny laser mirror sits quietly on the Moon tonight, catching laser beams from telescopes on Earth right now as you read this!",
              explorer: "Of all the hardware humanity left on the Moon, the Apollo retroreflectors are the only equipment that still produces active scientific data every single week.",
              commander: "The Apollo 11 LRRR represents an unbroken multi-generational instrument bridge linking Apollo-era astrophysics directly to 21st-century gravitational physics."
            }
          },
          {
            title: 'Beat 4: The Ascent Stage Blasts Off',
            subtitle: 'Using the golden stage as a launchpad to return home',
            challenge: {
              prompt: 'Liftoff Dilemma: How did astronauts blast off the Moon without building a launch pad or concrete tower?',
              options: [
                {
                  text: 'A) The golden descent stage remained behind as their launchpad',
                  correct: true,
                  feedback: 'Masterpiece of engineering! The descent stage served as the launch platform, holding the ascent engine steady while pyrotechnic guillotines severed the cables!'
                },
                {
                  text: 'B) Michael Collins beamed a giant tractor beam down from orbit',
                  correct: false,
                  feedback: 'Tractor beams are sci-fi! The LM ascent engine fired 15.6 kN of rocket thrust directly off the top deck of the golden descent stage to reach lunar orbit.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: The Discarded Lunar Equipment Cache',
              secretFact: 'To shed weight so the ascent engine had enough fuel to reach orbit, Neil and Buzz tossed their heavy PLSS backpack life-support suits, lunar overshoes, and Hasselblad camera bodies onto the lunar surface right before closing the hatch.',
              telemetry: 'Ascent Thrust: 3,500 lbs (15.6 kN) • Orbit Insertion: 60 nautical miles • Ascent Dry Mass: 2,150 kg • Jettison Location: Lunar Orbit'
            },
            robot: {
              cadet: "3... 2... 1... CLICK! An explosive knife snipped the wires, and WHOOSH! The astronauts' cabin blasted back up into the starry sky! But my four golden legs stayed behind on the Moon, acting as their loyal launchpad. Every extra pound left behind helped them zoom back home safely to Earth.",
              explorer: "To escape lunar gravity, Eagle split in two. Guillotine blades severed the cables and umbilical lines, and the ascent engine fired right off the top deck of the golden descent stage. The descent stage had served its purpose—now it remained on the Moon as humanity's first monument.",
              commander: "Ascent stage separation utilized explosive guillotine knives to sever umbilical conduits and pyrotechnic frangible nuts to release four interstage structural fittings. The Ascent Propulsion System (APS) delivered 15.6 kN of thrust, propelling the cabin into a 60-nautical-mile orbital rendezvous trajectory."
            },
            engineer: {
              cadet: "We designed the golden stage to stay on the Moon forever because every pound left on the Moon saved rocket fuel to bring Neil and Buzz home alive!",
              explorer: "Leaving the descent stage behind was essential physics. Leaving 4,500 pounds of metal and fuel tanks on the Moon meant the ascent stage was light enough to reach lunar orbit and dock with Columbia.",
              commander: "Leaving the descent stage dry mass (2,034 kg) on the lunar surface ensured that the ascent propulsion stage possessed adequate delta-v margin (1,840 m/s) to achieve orbital rendezvous with CSM Columbia."
            },
            scientist: {
              cadet: "They brought home 47 pounds of Moon rocks that were 3.7 billion years old—older than almost any rock on Earth!",
              explorer: "The 47 pounds of rocks collected at Tranquility Base contained titanium-rich basalts and a mineral never seen before: Armalcolite (named after Armstrong, Aldrin, and Collins). They proved that the young Moon was once covered in an ocean of molten magma.",
              commander: "Petrological analysis of Tranquility Base basalts established the Lunar Magma Ocean hypothesis, demonstrating that the Moon underwent complete mantle-crust differentiation approximately 4.45 billion years ago."
            },
            mission_control: {
              cadet: "'Houston, we are docked!' Neil, Buzz, and Michael Collins hugged inside the mothership. The world breathed a huge sigh of relief!",
              explorer: "The ascent stage docked with Columbia on July 21. After the crew and sample boxes transferred safely, Eagle's ascent stage was jettisoned into lunar orbit—its ultimate resting place remains an astronomical mystery to this day.",
              commander: "LM ascent stage jettison confirmed at 23:41 UTC on July 21, 1969. Recent numerical perturbation modeling by Meador (2021) suggests Eagle's ascent stage may still remain in a quasi-stable lunar orbit."
            },
            explorer: {
              cadet: "Look at the four golden pads standing in the gray dirt. That was the launch pad that launched humanity into the cosmic future!",
              explorer: "Tranquility Base is untouched. The US flag was knocked over by the ascent rocket blast, but the golden legs, the TV camera, the laser mirror, and the boots footprints stand exactly as they were left.",
              commander: "Tranquility Base is designated under international space heritage conventions as the foundational archaeological site of the Anthropocene extraterrestrial expansion."
            }
          },
          {
            title: 'Beat 5: The Silent Shrine of Mankind',
            subtitle: '57 years in vacuum: preserved for millions of years',
            challenge: {
              prompt: 'Preservation Science: Why will Apollo 11\'s golden stage look almost identical 500,000 years from now?',
              options: [
                {
                  text: 'A) The vacuum of space has no wind, rain, oxygen, or moisture to cause rust or erosion',
                  correct: true,
                  feedback: 'Untouched for eternity! Without atmospheric weathering, erosion on the Moon occurs only from micrometeorites at a rate of just 1 millimeter every million years!'
                },
                {
                  text: 'B) NASA sends cleaning robots every month to polish the gold foil',
                  correct: false,
                  feedback: 'No cleaning robots! Tranquility Base is untouched. The titanium struts and stainless steel plaque will endure virtually unchanged for hundreds of millennia.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: High-Resolution LROC Orbital Photos',
              secretFact: 'In 2009 and 2012, NASA\'s Lunar Reconnaissance Orbiter dipped within 15 miles of the lunar surface. Its high-resolution cameras clearly photographed the descent stage, the EASEP station, and the dark walking trails worn into the dust by Neil Armstrong\'s boots.',
              telemetry: 'Age: 57 Years • Vacuum Level: 10^-12 torr • Temperature Range: -250°F to +250°F • Surface Footprint: 200 square meters'
            },
            robot: {
              cadet: "Up on the Moon, there is no wind to blow dust away, and no rain to rust my shiny gold skin! My four golden legs and the stainless steel plaque will stay on the Moon for millions of years, sparkling silently in the sunlight. When you gaze up at the Moon tonight, give a little wave to Tranquility Base!",
              explorer: "Because the Moon has no atmosphere, weather, or rain, hardware on the Moon doesn't rust, decay, or blow away. The Apollo 11 descent stage will look virtually identical 100,000 years from now. It is humanity's eternal time capsule preserved in the silence of space.",
              commander: "In the ultra-high vacuum of the lunar environment (10⁻¹² torr), mechanical degradation is limited to solar ultraviolet irradiation of Kapton blankets and micrometeorite bombardment at an estimated rate of 10⁻⁶ mm/year. Structural integrity of titanium 6Al-4V struts is projected to exceed 500,000 years."
            },
            engineer: {
              cadet: "We built it to last 4 days. It will outlast the Pyramids of Egypt by hundreds of thousands of years!",
              explorer: "The Kapton gold foils have crinkled from intense solar heating, but the titanium frame, the landing pads, and the plaque are immortal. It is the greatest monument engineers ever built.",
              commander: "Descent stage structural frames in 2024 exhibit pristine mechanical load margins. Micrometeorite cratering remains negligible relative to structural wall thickness across all primary load paths."
            },
            scientist: {
              cadet: "In 2009, NASA's LRO orbiter zoomed close to the Moon and took photos: you can clearly see my four legs and Neil's boot trails from outer space!",
              explorer: "NASA's Lunar Reconnaissance Orbiter photographed Tranquility Base from 15 miles overhead. Neil Armstrong's boot trail heading to Little West Crater is clearly visible as a dark footpath in the regolith.",
              commander: "LROC Narrow Angle Camera frame M175629160RE resolved the descent stage at 0.5-meter/pixel resolution, clearly capturing the four footpad shadow angles and Neil's traverse path to Little West Crater."
            },
            mission_control: {
              cadet: "Every time a kid looks at the Moon at night, they are looking right at our little golden spaceship.",
              explorer: "Tranquility Base showed what humanity can achieve when we unite around a bold peaceful dream. It was not the end of our journey—it was only the beginning.",
              commander: "Tranquility Base remains the gold standard of systems engineering, international scientific cooperation, and high-risk operational execution."
            },
            explorer: {
              cadet: "One day, you might be the astronaut who visits Tranquility Base! Remember to walk gently around the footprints!",
              explorer: "When human cities rise on the Moon, Tranquility Base will be their national park—a sacred shrine where our species first stepped beyond the cradle of Earth.",
              commander: "Tranquility Base stands as the premier archaeological monument of human civilization's transition into a spacefaring species."
            }
          }
        ]
      },

      'perseverance': {
        name: 'Perseverance & Ingenuity (Mars 2020)',
        callsign: 'Percy & Ginny',
        body: 'Mars',
        year: 2021,
        site: 'Jezero Crater Delta (Octavia E. Butler Landing)',
        model_file: '/models/perseverance_rover.glb',
        image: 'https://images-assets.nasa.gov/image/PIA24542/PIA24542~orig.jpg',
        beats: [
          {
            title: 'Beat 1: The Quest for Ancient Martian Life',
            subtitle: 'Targeting an ancient river delta in Jezero Crater',
            challenge: {
              prompt: 'Secret Message Challenge: Engineers hid a secret binary message in Percy\'s 70-foot parachute. What did it say?',
              options: [
                {
                  text: 'A) "DARE MIGHTY THINGS" and the GPS coordinates of JPL in California',
                  correct: true,
                  feedback: 'Decoded by internet sleuths in 6 hours! The red and white parachute segments encoded the motto of NASA JPL: "Dare Mighty Things" (34°11\'58" N 118°10\'31" W)!'
                },
                {
                  text: 'B) "HELLO ALIENS PLEASE DO NOT EAT OUR HELICOPTER"',
                  correct: false,
                  feedback: 'Haha, that would be funny! But NASA encoded Teddy Roosevelt\'s inspiring quote "Dare Mighty Things" in binary 10-bit code!'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: The Mars Meteorite Return Ticket',
              secretFact: 'Bolted inside Perseverance\'s SHERLOC laser spectrometer is a piece of Martian meteorite Sayh al Uhaymir 169 that blasted off Mars 600,000 years ago, fell to Earth in Oman in 1999, and was returned home to Mars by Percy to calibrate her cameras!',
              telemetry: 'Launch Date: July 30, 2020 • Launch Vehicle: Atlas V 541 • Target: Jezero Crater (28 miles wide) • Rover Mass: 2,260 lbs (1,025 kg)'
            },
            robot: {
              cadet: "VROOOM! I am the biggest rover ever built—the size of a shiny family SUV! In my belly, I carried a secret surprise: a tiny robotic baby helicopter named Ingenuity with twin spinning blades! We zoomed to Mars to explore Jezero Crater, an ancient river delta that was once filled with a sparkling blue lake!",
              explorer: "On July 30, 2020, I launched to search for fossilized microbial life in Jezero Crater—a 28-mile-wide impact crater that once held an 800-foot-deep lake. On my belly, I carried Ingenuity, the first aircraft destined to fly in the thin atmosphere of an alien world.",
              commander: "The Mars 2020 mission architecture paired the 1,025-kg Perseverance rover with the 1.8-kg Ingenuity technology demonstration rotorcraft. Targeting Jezero Crater's deltaic deposits, the scientific charter mandated searching for potential biosignatures and caching core samples for Mars Sample Return (MSR)."
            },
            engineer: {
              cadet: "We hid secret messages in my giant parachute! The red and white pattern spelled out: 'DARE MIGHTY THINGS' in secret computer code for sharp-eyed kids to decode!",
              explorer: "We engineered Terrain Relative Navigation (TRN): during parachute descent, Percy snapped photos of the ground, compared them to an onboard orbital map, and autonomously steered herself away from hazardous boulders and sand dunes into a smooth landing strip.",
              commander: "TRN and Range Trigger technology slashed the landing ellipse to 7.7 x 6.6 km, enabling direct targeted touchdown in close proximity to the hazardous boulder fields and scarps of the Jezero delta."
            },
            scientist: {
              cadet: "Jezero was once a giant lake fed by a rushing river! If ancient Martian microbes ever swam in that water, their fossils are trapped inside the muddy rock layers!",
              explorer: "On Earth, river deltas are where mud and organic carbon settle and preserve fossils for billions of years. We sent Percy to Jezero's ancient delta to see if life ever took root on early Mars.",
              commander: "Orbital CRISM reflectance spectra identified smectite clays and magnesium carbonates in Jezero delta foreset beds, providing optimal taphonomic preservation potential for ancient biosignatures."
            },
            mission_control: {
              cadet: "Liftoff in the middle of a worldwide pandemic! Scientists cheered and clapped from behind their computers all across the world!",
              explorer: "The launch team overcame unprecedented logistical hurdles in 2020. Liftoff aboard an Atlas V 541 executed with pinpoint accuracy toward Mars.",
              commander: "Centaur second burn injected the cruise stage into a hyperbolic escape trajectory with excess hyperbolic velocity exceeding 11.2 km/s."
            },
            explorer: {
              cadet: "Look closely at Percy's robotic arm—it holds a real piece of a Mars meteorite that fell to Earth, brought back home to Mars!",
              explorer: "A piece of Martian basalt blasted off Mars millions of years ago was carried back home to Mars inside Percy's SHERLOC spectrometer. It is humanity's first interplanetary round-trip artifact.",
              commander: "Perseverance's return of meteorite SaU 169 constitutes the premier round-trip physical artifact exchange between planetary bodies."
            }
          },
          {
            title: 'Beat 2: The Sky Crane Dance & Touchdown',
            subtitle: 'Seven minutes of terror captured in high-definition video',
            challenge: {
              prompt: 'EDL Descent Climax: You are 70 feet above Jezero Crater! How does Percy touch down without crushing her wheels?',
              options: [
                {
                  text: 'A) Lowered on nylon bridle cables beneath a hovering rocket sky crane',
                  correct: true,
                  feedback: 'Spectacular touchdown! The rocket backpack hovered on 4 hydrazine engines, lowered Percy gently at 1.7 mph, cut the cables, and rocketed away into the distance!'
                },
                {
                  text: 'B) Deploy a giant parachute that lands right on top of the rover',
                  correct: false,
                  feedback: 'Parachutes on Mars cannot slow down a 1-ton rover enough! The thin Martian air requires rocket propulsion for the final 60 feet.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: The Fallen Sky Crane Debris Field',
              secretFact: 'After lowering Percy, the descent stage rocketed 700 meters away and intentionally crash-landed. Months later, Ingenuity flew over the crash site and photographed the shattered backshell and parachute—the first aerial photos of spacecraft relics on another planet!',
              telemetry: 'Touchdown: Feb 18, 2021 (20:55 UTC) • Cable Length: 25 ft (7.6m) • Touchdown Velocity: 1.7 mph • Deceleration: 12G'
            },
            robot: {
              cadet: "Seven minutes of terror! A rocket-powered jetpack flew over Mars, hovered in the air, and lowered me down on strong nylon cables just like a flying crane! Once my six wheels touched the red dirt, the cables were SNIPPED, and the jetpack rocketed away into the distance! High-definition cameras filmed the whole magical ride!",
              explorer: "On February 18, 2021, the sky crane descent stage lowered me gently onto the dusty floor of Jezero Crater. High-definition cameras filmed the deployment, capturing the nylon bridles flexing and the dust billowing beneath my wheels—a space exploration first!",
              commander: "Powered descent initiated at 2,100 meters altitude. Four dual-hydrazine rocket thrusters stabilized the descent stage, lowering the rover 7.6 meters on triple nylon bridles at 0.75 m/s before executing instantaneous pyrotechnic cord cutter separation."
            },
            engineer: {
              cadet: "We put real microphones on a Mars spaceship for the first time! We recorded the actual sound of Martian wind whistling and rocks crunching under wheels!",
              explorer: "For decades, humanity had only imagined what Mars sounded like. Percy's SuperCam and EDL microphones captured the true sound of Martian gusts, the hum of rover motors, and the snap of laser zaps vaporizing rock.",
              commander: "SuperCam and EDL acoustic sensors recorded frequencies from 20 Hz to 50 kHz, measuring acoustic attenuation and establishing the speed of sound at 240 m/s in Jezero's 95% CO₂ atmosphere."
            },
            scientist: {
              cadet: "We named the landing site Octavia E. Butler, in honor of an inspiring author who wrote marvelous stories about space and humanity!",
              explorer: "Touchdown was so precise that Percy landed just 1.7 miles from the ancient river delta cliff. The rocks under her wheels were igneous volcanic basalt—older than almost any rock on Earth!",
              commander: "Geomorphological analysis established that the crater floor was composed of olivine-bearing basaltic cumulate (Séítah formation), providing a crucial chronological anchor for the Jezero crater floor."
            },
            mission_control: {
              cadet: "Swati Mohan announced into the microphone: 'Touchdown confirmed! Perseverance safely on the surface of Mars!' The whole world erupted in cheers!",
              explorer: "The iconic high-resolution photo of the rover suspended on nylon cables beneath the firing thrusters became an instant sensation. We were on Mars to search for ancient life.",
              commander: "Touchdown telemetry received via Mars Reconnaissance Orbiter UHF relay at 20:55 UTC. All six wheels established positive ground contact with zero chassis tilt."
            },
            explorer: {
              cadet: "A mile away from Percy, you can find the sky crane crash site—the loyal rocket jetpack that sacrificed itself to land the rover safely.",
              explorer: "The discarded parachute, backshell, and sky crane were later photographed by Ingenuity flying overhead—archaeological relics scattered across the red sands.",
              commander: "The Jezero EDL debris field represents the most extensively photographed extraterrestrial landing artifact assemblage in history."
            }
          },
          {
            title: 'Beat 3: Ingenuity Takes Flight in Alien Skies',
            subtitle: 'The Wright Brothers moment on another planet',
            challenge: {
              prompt: 'Aeronautical Physics: Mars air is 100 times thinner than Earth air. How did Ingenuity generate enough lift to fly?',
              options: [
                {
                  text: 'A) Ultra-light carbon blades spinning at 2,400 RPM (5 times faster than Earth helicopters)',
                  correct: true,
                  feedback: 'Extraterrestrial Aviation History! Ingenuity weighed only 1.8 kg and spun its twin counter-rotating carbon blades at 2,400 RPM, achieving humanity\'s first powered flight on another planet!'
                },
                {
                  text: 'B) A giant hot air balloon filled with rocket exhaust',
                  correct: false,
                  feedback: 'Balloons cannot steer or survive -130°C nights! Ingenuity used autonomous solar-recharged batteries and high-speed carbon blades.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: Wright Brothers Wing Fabric',
              secretFact: 'Taped underneath Ingenuity\'s solar panel with insulating tape is a postage-stamp-sized piece of muslin wing fabric from the Wright Brothers\' 1903 Flyer, forever linking Kitty Hawk, North Carolina, with Jezero Crater, Mars.',
              telemetry: 'Total Flights: 72 (Planned: 5) • Air Time: 128.8 minutes • Distance Flown: 17.0 km • Max Altitude: 24 meters (79 ft)'
            },
            robot: {
              cadet: "WHIRRRRR! My little helicopter friend Ingenuity spun its carbon-fiber wings five times faster than an Earth helicopter! Up, up, and away it went, flying through the thin Martian air! Taped beneath its solar wing was a tiny piece of real fabric from the Wright Brothers' very first airplane from 1903!",
              explorer: "On April 19, 2021, Ingenuity made history. It spun its twin counter-rotating carbon blades at 2,400 RPM and rose 10 feet into the thin Martian sky, executing humanity's first powered, controlled flight on another world.",
              commander: "Mars atmospheric density is approximately 1% of Earth's sea-level density. Counter-rotating coaxial rotors generating 1.2 kW power achieved the first controlled, powered atmospheric flight on another celestial body, validating rotorcraft aerodynamic models in low Reynolds-number regimes."
            },
            engineer: {
              cadet: "Ingenuity was only built to fly 5 times as a little test. Instead, it flew 72 times across three amazing years!",
              explorer: "Ingenuity blew past all expectations. Designed as a 30-day technology demonstration, it transformed into an indispensable aerial scout, flying ahead of Percy to map safe driving paths through treacherous sand dunes.",
              commander: "Ingenuity logged 128.8 total flight minutes across 72 sorties, covering 17.0 km and reaching altitudes of 24 meters before sustaining rotor tip damage during a low-contrast landing in January 2024."
            },
            scientist: {
              cadet: "From high in the sky, Ingenuity spotted rock layers and sand traps that we couldn't see from the ground!",
              explorer: "Aerial photography from Ingenuity revealed ancient river channels and sand ridges in the Séítah formation, saving Perseverance weeks of dangerous navigation around impassable obstacles.",
              commander: "Aerial reconnaissance enabled targeted tactical traverse planning, pinpointing optimal sample coring targets along the delta scarp and reducing rover mission transit risks."
            },
            mission_control: {
              cadet: "Flight 1, 2, 3... all the way to Flight 72! We named its landing airfields after Orville and Wilbur Wright!",
              explorer: "Every flight was celebrated like launch day. In January 2024, after rotor damage on Flight 72, Ingenuity touched down upright and retired safely as a permanent stationary weather station.",
              commander: "Ingenuity officially concluded flight operations in January 2024. Its avionics remain operational, logging solar panel performance and temperature telemetry for transmission to Perseverance."
            },
            explorer: {
              cadet: "Ingenuity sits proudly on a gentle sand ripple in Jezero Crater, its four carbon legs planted in red dust.",
              explorer: "The Wright Brothers flew for 12 seconds in Kitty Hawk; Ingenuity flew for over 2 hours on Mars. Two historic machines separated by 140 million miles, forever linked by a piece of wing cloth.",
              commander: "Ingenuity's final resting site at Valinor Hills constitutes the historic birthplace and permanent monument of extraterrestrial aviation."
            }
          },
          {
            title: 'Beat 4: The Sample Depot at Three Forks',
            subtitle: 'Sealing Martian rocks in golden tubes for a future rocket',
            challenge: {
              prompt: 'Sample Caching Challenge: Why did Percy build a sample depot of 10 duplicate tubes on the ground at Three Forks?',
              options: [
                {
                  text: 'A) As a backup cache in case Percy cannot deliver her internal tubes to a future retrieval lander',
                  correct: true,
                  feedback: 'Masterful redundancy! If Percy breaks down, retrieval helicopters can easily pick up the 10 tubes left at the Three Forks flat runway and load them into the Earth return rocket!'
                },
                {
                  text: 'B) Because her belly was full and she wanted to lighten her weight',
                  correct: false,
                  feedback: 'Percy has room for 43 tubes inside her chassis! The Three Forks depot was intentionally placed as a safe, flat backup depot for Mars Sample Return.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: Ultra-Pure Titanium Sample Tubes',
              secretFact: 'The interior of Percy\'s sample tubes is the cleanest place in the known solar system. Baked to 660°F and sealed in ultra-clean rooms, they contain less than 1 part per billion of organic Earth carbon to guarantee Martian authenticity.',
              telemetry: 'Tubes Cached: 10 • Tube Material: Grade 5 Titanium • Tube Length: 6 inches (15 cm) • Cache Location: Three Forks Depot'
            },
            robot: {
              cadet: "Drill, spin, tap! I drilled into ancient mud rocks and sealed the rock cores inside 10 shiny golden titanium tubes. Then I dropped them gently on the sand at Three Forks like a cosmic treasure hunt! One day, a future rocket will fly from Earth to pick up my treasure boxes!",
              explorer: "At 'Three Forks', I built the first extraterrestrial sample depot. I drilled 10 duplicate titanium tubes with cores of river delta sediment, igneous rock, and Martian atmosphere, laying them carefully on the flat ground for a future retrieval spacecraft to bring to Earth.",
              commander: "The Three Forks Sample Depot comprises 10 hermetically sealed Grade 5 titanium tubes deposited between December 2022 and January 2023, establishing a redundant surface cache for the Mars Sample Return (MSR) campaign."
            },
            engineer: {
              cadet: "The inside of those tubes is the cleanest place in the solar system! No Earth germs allowed!",
              explorer: "We baked and sterilized the sample tubes in sterile chambers. If future scientists examine these rocks in laboratories on Earth, they must be 100% sure that any organic molecules are genuinely from Mars, not Earth.",
              commander: "Collection hardware conformed to Category V planetary protection criteria, ensuring organic baseline contamination stayed below 1 ppb per target sample tube."
            },
            scientist: {
              cadet: "We found leopard spots in the rock! On Earth, those exact chemical spots are made by ancient microbes living in water!",
              explorer: "In July 2024 at 'Cheyava Falls', Percy discovered rock veins filled with calcium sulfate and covered in tiny 'leopard spots' containing iron and phosphate—a potential biosignature of ancient microbial life!",
              commander: "Mudstone analysis at Cheyava Falls identified reaction halos ('leopard spots') containing reduced iron and phosphate, resembling microbial redox reaction signatures found in terrestrial lacustrine deposits."
            },
            mission_control: {
              cadet: "AutoNav driving! Percy doesn't even wait for Earth to steer her—she picks her own driving paths with artificial intelligence!",
              explorer: "With her AutoNav navigation computer, Percy drives autonomously up to 300 meters a day, picking her own paths around boulders in real time while human drivers are asleep in California.",
              commander: "Enhanced AutoNav dedicated FPGA image processing slashed driving stops to zero, achieving an off-world single-day autonomous driving record of 347.7 meters."
            },
            explorer: {
              cadet: "Ten golden tubes lying in the sand at Three Forks, waiting for a spaceship from Earth to pick them up.",
              explorer: "Those sample tubes are humanity's message in a bottle. Inside them is the answer to the greatest question ever asked: are we alone in the universe?",
              commander: "The Three Forks depot represents humanity's primary extraterrestrial sample archive, awaiting retrieval by robotic or crewed Mars Sample Return architecture."
            }
          },
          {
            title: 'Beat 5: Climbing the Rim into Tomorrow',
            subtitle: 'The journey continues past the crater walls',
            challenge: {
              prompt: 'Atmospheric ISRU: How did the MOXIE experiment on Percy generate pure breathable oxygen on Mars?',
              options: [
                {
                  text: 'A) Solid oxide electrolysis: sucking in CO2 and splitting it into O2 and carbon monoxide',
                  correct: true,
                  feedback: 'Breathtaking breakthrough! MOXIE produced 122 grams of 98% pure oxygen from Martian air—proving future human astronauts can manufacture their own breathing air on Mars!'
                },
                {
                  text: 'B) Growing green plants inside a greenhouse on the rover roof',
                  correct: false,
                  feedback: 'Plants cannot survive -130°C Martian nights and high radiation without shelter! MOXIE used an electrochemical toaster-sized generator.'
                }
              ]
            },
            dossier: {
              title: 'Classified Artifact: Nuclear MMRTG Power Generator',
              secretFact: 'Unlike solar rovers that can be choked by dust storms, Perseverance is powered by an MMRTG nuclear battery loaded with 10.6 lbs of plutonium-238, providing steady electricity and warm heat day and night for over 14 years!',
              telemetry: 'Power Source: MMRTG (110W Electrical) • Oxygen Made: 122 grams • Rim Elevation: +1,000 ft • Target Horizon: 2030s+'
            },
            robot: {
              cadet: "My adventure isn't over—I am climbing a giant 1,000-foot mountain cliff right now! My nuclear battery gives me power day and night. Plus, my MOXIE machine made real, fresh oxygen out of thin Martian air! One day, brave human astronauts will hike up my tire tracks and explore Mars beside me!",
              explorer: "Perseverance is currently climbing the 1,000-foot rim of Jezero Crater to investigate bedrock formed before the lake even existed. Powered by an MMRTG nuclear battery that never sleeps, Percy has years of groundbreaking exploration ahead.",
              commander: "Perseverance's MMRTG power generator delivers steady 110W electrical power and thermal heating, enabling continuous tactical operations through Martian winter and extended campaigns up the Jezero crater rim toward the fractured bedrock of Nili Planum."
            },
            engineer: {
              cadet: "Her nuclear battery never sleeps. It keeps her warm during freezing -130 degree Martian nights without needing a single ray of sunlight!",
              explorer: "Unlike solar rovers that can be choked by dust storms, Percy's plutonium power source generates heat and electricity day and night, in winter or summer, storm or clear skies.",
              commander: "The MMRTG supplies thermal energy via pumped Freon coolant loops, eliminating the diurnal thermal fatigue that eventually degraded earlier solar rovers."
            },
            scientist: {
              cadet: "MOXIE made real breathable oxygen out of the thin Martian air! Enough for a small astronaut or space puppy to breathe for several hours!",
              explorer: "Percy carried MOXIE—a golden toaster-sized instrument that extracted Martian carbon dioxide and turned it into pure oxygen. It proved humans can manufacture their own breathing air and rocket oxidizer on Mars.",
              commander: "MOXIE completed 16 successful runs, producing 122 grams of 98% pure oxygen via solid oxide electrolysis, validating in-situ resource utilization (ISRU) for future human Mars ascent vehicles."
            },
            mission_control: {
              cadet: "Every day, fresh photos beam down from Mars. Anyone on Earth can look at pictures taken just hours ago by our robot explorer!",
              explorer: "Thousands of raw images are published online every day. Anyone on Earth can look through Percy's eyes and explore Mars in real time alongside NASA scientists.",
              commander: "Tactical uplink cycles execute daily over DSN X-band, with downlink data rates achieving up to 2 Mbps through MAVEN, TGO, and Odyssey relay passes."
            },
            explorer: {
              cadet: "Percy is writing history right now. And one day, human astronauts will catch up to her tire tracks and build a home on Mars!",
              explorer: "When human boots finally step onto Mars, they will follow the trail blazed by Perseverance. She is not just an abandoned machine—she is the forerunner of our species.",
              commander: "Perseverance and Ingenuity stand at the vanguard of human interplanetary migration, transforming Mars from an alien wasteland into our species' second home."
            }
          }
        ]
      }
    };

    this.init();
  }

  init() {
    this.injectStoryRoomModal();
    this.bindGlobalTriggers();
    this.initVoiceList();
  }

  initVoiceList() {
    if (this.synth) {
      this.synth.onvoiceschanged = () => {
        this.activeVoiceObj = this.getBestVoice();
      };
    }
  }

  getBestVoice() {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    if (this.narratorGender === 'female') {
      const femaleKeywords = [
        'zira', 'jenny', 'aria', 'samantha', 'victoria', 'karen', 'moira', 'fiona',
        'tessa', 'sangeeta', 'veena', 'female', 'natural (female)', 'hazel', 'susan', 'catherine'
      ];
      for (const kw of femaleKeywords) {
        const found = pool.find(v => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }
      const maleKeywords = ['david', 'george', 'mark', 'james', 'richard', 'male', 'guy', 'christopher'];
      const nonMale = pool.find(v => !maleKeywords.some(mk => v.name.toLowerCase().includes(mk)));
      if (nonMale) return nonMale;
    } else {
      const maleKeywords = ['david', 'guy', 'george', 'mark', 'james', 'richard', 'daniel', 'oliver'];
      for (const kw of maleKeywords) {
        const found = pool.find(v => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }
    }

    return pool[0];
  }

  bindGlobalTriggers() {
    window.openStoryMode = (heroId = 'opportunity') => {
      this.open(heroId);
    };

    window.addEventListener('open-story-mode', (e) => {
      const heroId = e.detail?.heroId || 'opportunity';
      this.open(heroId);
    });
  }

  injectStoryRoomModal() {
    let modal = document.getElementById('story-mode-modal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'story-mode-modal';
    modal.className = 'story-room-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Interactive Voice Storytelling Room');

    modal.innerHTML = `
      <div class="story-room-backdrop"></div>
      <div class="story-room-container">
        <!-- Top Control Bar -->
        <header class="story-room-header">
          <div class="story-header-left">
            <span class="story-brand-badge">🎙️ Interactive Storytelling Room</span>
            <div class="story-hero-tabs" id="story-hero-tabs">
              <button class="hero-tab-btn active" data-hero="opportunity">Opportunity</button>
              <button class="hero-tab-btn" data-hero="apollo11">Apollo 11</button>
              <button class="hero-tab-btn" data-hero="perseverance">Perseverance</button>
            </div>
          </div>

          <div class="story-header-right">
            <!-- Voice Gender Switcher -->
            <div class="story-voice-gender-wrap">
              <button id="btn-toggle-voice-gender" class="btn-voice-gender-pill active-female" title="Toggle between natural Female and Male voice">
                <span class="gender-icon">👩</span>
                <span class="gender-label">Narrator: Female (Dr. Elena)</span>
              </button>
            </div>

            <!-- Age Selector -->
            <div class="story-age-selector" role="radiogroup" aria-label="Select Age Band">
              <span class="age-selector-label">Audience:</span>
              <button class="age-pill-btn active" data-age="cadet" title="Ages 6-8: Playful words, sound effects, vivid analogies">🐣 Cadet (6-8)</button>
              <button class="age-pill-btn" data-age="explorer" title="Ages 9-11: High-stakes adventure science, discovery milestones">🚀 Explorer (9-11)</button>
              <button class="age-pill-btn" data-age="commander" title="Ages 12-14: Engineering, telemetry, orbital mechanics, geology">🛰️ Commander (12-14)</button>
            </div>

            <!-- Close Button -->
            <button class="story-close-btn" id="btn-close-story-room" aria-label="Close Storytelling Room">&times;</button>
          </div>
        </header>

        <!-- Main Narrative Stage Layout -->
        <main class="story-room-stage">
          <!-- Left: Hero Visual & Perspective Switcher -->
          <aside class="story-stage-sidebar">
            <div class="story-hero-card">
              <div class="story-hero-img-wrap">
                <img id="story-hero-img" src="" alt="Hero Spacecraft" loading="lazy">
                <span id="story-hero-tag" class="story-hero-tag">Mars • 2004</span>
              </div>
              <h3 id="story-hero-title">Opportunity Rover</h3>
              <p id="story-hero-site">Meridiani Planum to Endeavour Crater</p>
            </div>

            <!-- 5 Perspective Switcher -->
            <div class="perspective-switcher-box">
              <div class="perspective-box-header">
                <span>🎭 Voice Perspective</span>
                <span class="perspective-hint">Change who tells the story</span>
              </div>
              <div class="perspective-buttons-list" id="perspective-buttons">
                <button class="perspective-btn active" data-persp="robot">
                  <span class="persp-icon">🤖</span>
                  <div class="persp-meta">
                    <strong>The Robot</strong>
                    <small>First-person, curious explorer</small>
                  </div>
                </button>
                <button class="perspective-btn" data-persp="engineer">
                  <span class="persp-icon">🔧</span>
                  <div class="persp-meta">
                    <strong>The Engineer</strong>
                    <small>Hardware, telemetry, emergency fixes</small>
                  </div>
                </button>
                <button class="perspective-btn" data-persp="scientist">
                  <span class="persp-icon">🔬</span>
                  <div class="persp-meta">
                    <strong>The Scientist</strong>
                    <small>Geology, questions, water discoveries</small>
                  </div>
                </button>
                <button class="perspective-btn" data-persp="mission_control">
                  <span class="persp-icon">📡</span>
                  <div class="persp-meta">
                    <strong>Mission Control</strong>
                    <small>Countdowns, wake-up songs, suspense</small>
                  </div>
                </button>
                <button class="perspective-btn" data-persp="explorer">
                  <span class="persp-icon">👨‍🚀</span>
                  <div class="persp-meta">
                    <strong>Future Explorer</strong>
                    <small>Standing beside the relic years later</small>
                  </div>
                </button>
              </div>
            </div>

            <!-- Quick Action: Launch Interactive 3D Model -->
            <button id="btn-story-inspect-3d" class="btn-inspect-3d-link">
              <span>🛰️ Inspect in 3D Stage</span>
            </button>
          </aside>

          <!-- Right: 5-Beat Story Arc & Interactive Teleprompter -->
          <section class="story-stage-main">
            <!-- 5-Beat Timeline Navigation Stepper -->
            <nav class="story-beats-stepper" id="story-beats-stepper" aria-label="Story Beats">
              <button class="beat-step-btn active" data-beat="0">
                <span class="beat-num">1</span>
                <span class="beat-name">Launch</span>
              </button>
              <button class="beat-step-btn" data-beat="1">
                <span class="beat-num">2</span>
                <span class="beat-name">Journey</span>
              </button>
              <button class="beat-step-btn" data-beat="2">
                <span class="beat-num">3</span>
                <span class="beat-name">Challenge</span>
              </button>
              <button class="beat-step-btn" data-beat="3">
                <span class="beat-num">4</span>
                <span class="beat-name">Discovery</span>
              </button>
              <button class="beat-step-btn" data-beat="4">
                <span class="beat-num">5</span>
                <span class="beat-name">Legacy</span>
              </button>
            </nav>

            <!-- Interactive Soundboard Bar -->
            <div class="story-soundboard-bar" aria-label="Mission Soundboard SFX">
              <span class="sfx-bar-label">🎧 Mission Soundboard:</span>
              <div class="sfx-buttons-row">
                <button class="sfx-btn" id="sfx-blastoff" title="Play Synthesized Rocket Blastoff Countdown">
                  🚀 Blastoff Roar
                </button>
                <button class="sfx-btn" id="sfx-wind" title="Play Authentic Thin-Air Martian Wind Gale">
                  🌪️ Mars Wind
                </button>
                <button class="sfx-btn" id="sfx-wakeup" title="Play NASA Mission Control Morning Wake-up Song">
                  📻 Wake-up Chime
                </button>
                <button class="sfx-btn" id="sfx-laser" title="Play High-Tech Rock Vaporizer Laser Pulse">
                  🔴 Laser Zap
                </button>
                <button class="sfx-btn" id="sfx-airbag" title="Play Springy 24-Airbag Landing Bounce">
                  🎈 Airbag Boing
                </button>
              </div>
            </div>

            <!-- Active Beat Narrative Display -->
            <article class="story-narrative-article">
              <div class="narrative-meta-badge">
                <span id="story-beat-badge">Beat 1 of 5</span>
                <span id="story-persp-badge">Speaking as: The Robot</span>
                <span id="story-voice-indicator" class="voice-indicator-pill voice-female">👩 Narrator: Dr. Elena Vance (Natural Female Voice)</span>
              </div>
              <h2 id="story-beat-title">Beat Title</h2>
              <h4 id="story-beat-subtitle">Beat Subtitle</h4>

              <!-- Real-time teleprompter text box with sentence highlighting & click-to-speak -->
              <div class="story-teleprompter" id="story-teleprompter">
                <p id="story-spoken-text">Story text loading...</p>
              </div>

              <!-- Interactive Mission Challenge & Decision Box -->
              <div class="story-challenge-card" id="story-challenge-card">
                <div class="challenge-header">
                  <span class="challenge-icon">🎯</span>
                  <div class="challenge-title-group">
                    <strong>Beat Mission Decision Challenge</strong>
                    <span id="challenge-prompt-text">Loading challenge...</span>
                  </div>
                </div>
                <div class="challenge-options-row" id="challenge-options-row">
                  <!-- Injected via render() -->
                </div>
                <div class="challenge-feedback-box" id="challenge-feedback-box" style="display:none;"></div>
              </div>

              <!-- Secret Dossier & Artifact Drawer -->
              <div class="story-dossier-card" id="story-dossier-card">
                <button class="btn-toggle-dossier" id="btn-toggle-dossier">
                  <span class="dossier-btn-icon">📂</span>
                  <span id="dossier-btn-title">View Secret Mission Artifact & Telemetry Dossier</span>
                  <span class="dossier-arrow">▾</span>
                </button>
                <div class="dossier-drawer-content" id="dossier-drawer-content" style="display:none;">
                  <h4 id="dossier-title">Classified Artifact Specification</h4>
                  <p id="dossier-fact" class="dossier-fact-text">Secret fact...</p>
                  <div class="dossier-telemetry-pill">
                    <span class="pill-label">📡 Verified Telemetry:</span>
                    <span id="dossier-telemetry-val">Data values...</span>
                  </div>
                </div>
              </div>
            </article>

            <!-- Bottom Audio Player & Voice Controls HUD -->
            <footer class="story-audio-controller">
              <div class="audio-controls-left">
                <!-- Play/Pause Voice Narration -->
                <button id="btn-story-play-voice" class="btn-voice-master" title="Play or pause female voice narration">
                  <span class="master-play-icon">▶</span>
                  <span class="master-play-text">Narrate Story (Female Voice)</span>
                </button>

                <!-- Audio Equalizer Waveform Animation -->
                <div class="audio-wave-bars" id="audio-wave-bars">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>

                <div class="voice-speed-box">
                  <span class="speed-label">Speed:</span>
                  <button class="speed-btn active" data-speed="1.0">1.0x</button>
                  <button class="speed-btn" data-speed="0.85">0.85x</button>
                  <button class="speed-btn" data-speed="1.2">1.2x</button>
                </div>

                <!-- Ambient Space Telemetry Sound Toggle -->
                <button id="btn-toggle-ambient" class="btn-ambient-toggle active" title="Toggle subtle space telemetry audio">
                  <span>🔊</span> Ambient FX
                </button>
              </div>

              <div class="audio-controls-right">
                <button id="btn-beat-prev" class="btn-beat-nav" title="Previous story beat">‹ Previous Beat</button>
                <button id="btn-beat-next" class="btn-beat-nav btn-beat-nav-primary" title="Next story beat">Next Beat ›</button>
              </div>
            </footer>
          </section>
        </main>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    this.bindEvents();
  }

  bindEvents() {
    const m = this.modal;
    if (!m) return;

    // Close button
    m.querySelector('#btn-close-story-room').addEventListener('click', () => this.close());
    m.querySelector('.story-room-backdrop').addEventListener('click', () => this.close());

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && m.classList.contains('active')) {
        this.close();
      }
    });

    // Voice Gender Toggle
    const genderBtn = m.querySelector('#btn-toggle-voice-gender');
    genderBtn.addEventListener('click', () => {
      this.narratorGender = (this.narratorGender === 'female') ? 'male' : 'female';
      const isFemale = (this.narratorGender === 'female');
      genderBtn.classList.toggle('active-female', isFemale);
      genderBtn.classList.toggle('active-male', !isFemale);
      genderBtn.querySelector('.gender-icon').textContent = isFemale ? '👩' : '👨';
      genderBtn.querySelector('.gender-label').textContent = isFemale ? 'Narrator: Female (Dr. Elena)' : 'Narrator: Male (Dir. Dave)';

      this.updateVoiceIndicatorUI();
      this.playPerspectiveSwitchBeep();

      if (this.isPlayingVoice) {
        this.stopVoice();
        this.speakCurrentBeat();
      }

      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast(isFemale ? 'Switched to Natural Female Voice (Dr. Elena Vance)!' : 'Switched to Male Voice (Flight Director Dave)!', '🎙️', 2500);
      }
    });

    // Hero switcher tabs
    m.querySelectorAll('.hero-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        m.querySelectorAll('.hero-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentHeroId = btn.getAttribute('data-hero');
        this.currentBeatIndex = 0;
        this.stopVoice();
        this.render();
      });
    });

    // Age band pills
    m.querySelectorAll('.age-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        m.querySelectorAll('.age-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentAgeBand = btn.getAttribute('data-age');
        this.stopVoice();
        this.render();
        if (typeof window.showSpaceToast === 'function') {
          const names = { cadet: 'Cadet (Ages 6–8)', explorer: 'Explorer (Ages 9–11)', commander: 'Commander (Ages 12–14)' };
          window.showSpaceToast(`Audience switched to ${names[this.currentAgeBand]}! Narrative depth updated.`, '🚀', 2500);
        }
      });
    });

    // Perspective buttons
    m.querySelectorAll('.perspective-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        m.querySelectorAll('.perspective-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPerspective = btn.getAttribute('data-persp');
        this.stopVoice();
        this.render();
        this.playPerspectiveSwitchBeep();
      });
    });

    // Beat stepper buttons
    m.querySelectorAll('.beat-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentBeatIndex = parseInt(btn.getAttribute('data-beat'), 10);
        this.stopVoice();
        this.render();
      });
    });

    // Beat navigation
    m.querySelector('#btn-beat-prev').addEventListener('click', () => {
      if (this.currentBeatIndex > 0) {
        this.currentBeatIndex--;
        this.stopVoice();
        this.render();
      }
    });

    m.querySelector('#btn-beat-next').addEventListener('click', () => {
      const hero = this.heroStories[this.currentHeroId];
      if (this.currentBeatIndex < hero.beats.length - 1) {
        this.currentBeatIndex++;
        this.stopVoice();
        this.render();
      } else {
        if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast(`🎉 You completed the full story of ${hero.name}! Try another voice perspective or hero mission.`, '🏆', 4000);
        }
      }
    });

    // Voice Play/Pause button
    m.querySelector('#btn-story-play-voice').addEventListener('click', () => {
      if (this.isPlayingVoice) {
        this.stopVoice();
      } else {
        this.speakCurrentBeat();
      }
    });

    // Speed buttons
    m.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        m.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.speechRate = parseFloat(btn.getAttribute('data-speed'));
        if (this.isPlayingVoice) {
          this.stopVoice();
          this.speakCurrentBeat();
        }
      });
    });

    // Ambient FX Toggle
    const ambBtn = m.querySelector('#btn-toggle-ambient');
    ambBtn.addEventListener('click', () => {
      this.ambientEnabled = !this.ambientEnabled;
      ambBtn.classList.toggle('active', this.ambientEnabled);
      if (!this.ambientEnabled && this.ambientSoundNode) {
        this.ambientSoundNode.stop();
        this.ambientSoundNode = null;
      } else if (this.ambientEnabled) {
        this.startAmbientCosmicHum();
      }
    });

    // Soundboard SFX Triggers
    m.querySelector('#sfx-blastoff').addEventListener('click', () => this.playBlastoffSFX());
    m.querySelector('#sfx-wind').addEventListener('click', () => this.playWindSFX());
    m.querySelector('#sfx-wakeup').addEventListener('click', () => this.playWakeupMelodySFX());
    m.querySelector('#sfx-laser').addEventListener('click', () => this.playLaserSFX());
    m.querySelector('#sfx-airbag').addEventListener('click', () => this.playAirbagBoingSFX());

    // Toggle Dossier Drawer
    m.querySelector('#btn-toggle-dossier').addEventListener('click', () => {
      const drawer = m.querySelector('#dossier-drawer-content');
      const arrow = m.querySelector('.dossier-arrow');
      const isOpen = drawer.style.display !== 'none';
      drawer.style.display = isOpen ? 'none' : 'block';
      arrow.textContent = isOpen ? '▾' : '▴';
    });

    // Inspect in 3D stage link
    m.querySelector('#btn-story-inspect-3d').addEventListener('click', () => {
      this.close();
      const idMap = {
        'opportunity': 'opportunity-rover',
        'apollo11': 'apollo-11-descent-stage',
        'perseverance': 'perseverance-rover'
      };
      const objectId = idMap[this.currentHeroId];
      if (objectId && typeof window.openObjectPage === 'function') {
        window.openObjectPage(objectId);
      }
    });
  }

  updateVoiceIndicatorUI() {
    const indicator = this.modal?.querySelector('#story-voice-indicator');
    const playBtn = this.modal?.querySelector('#btn-story-play-voice');
    if (!indicator) return;

    if (this.narratorGender === 'female') {
      indicator.innerHTML = '👩 Narrator: Dr. Elena Vance (Natural Female Voice)';
      indicator.className = 'voice-indicator-pill voice-female';
      if (playBtn && !this.isPlayingVoice) {
        playBtn.querySelector('.master-play-text').textContent = 'Narrate Story (Female Voice)';
      }
    } else {
      indicator.innerHTML = '👨 Narrator: Flight Director Dave (Male Voice)';
      indicator.className = 'voice-indicator-pill voice-male';
      if (playBtn && !this.isPlayingVoice) {
        playBtn.querySelector('.master-play-text').textContent = 'Narrate Story (Male Voice)';
      }
    }
  }

  open(heroId = 'opportunity') {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (this.heroStories[heroId]) {
      this.currentHeroId = heroId;
      const tabs = this.modal.querySelectorAll('.hero-tab-btn');
      tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-hero') === heroId));
    }

    this.currentBeatIndex = 0;
    this.render();
    this.startAmbientCosmicHum();
  }

  close() {
    this.stopVoice();
    if (this.ambientSoundNode) {
      try { this.ambientSoundNode.stop(); } catch (e) {}
      this.ambientSoundNode = null;
    }
    if (this.modal) {
      this.modal.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  render() {
    const hero = this.heroStories[this.currentHeroId];
    if (!hero) return;

    const beat = hero.beats[this.currentBeatIndex];
    if (!beat) return;

    const m = this.modal;

    // Sidebar Hero Info
    m.querySelector('#story-hero-title').textContent = hero.name;
    m.querySelector('#story-hero-site').textContent = hero.site;
    m.querySelector('#story-hero-tag').textContent = `${hero.body} • ${hero.year}`;
    m.querySelector('#story-hero-img').src = hero.image;

    // Stepper buttons state
    m.querySelectorAll('.beat-step-btn').forEach((b, idx) => {
      b.classList.toggle('active', idx === this.currentBeatIndex);
    });

    // Prev / Next button state
    const prevBtn = m.querySelector('#btn-beat-prev');
    const nextBtn = m.querySelector('#btn-beat-next');
    prevBtn.disabled = (this.currentBeatIndex === 0);
    nextBtn.textContent = (this.currentBeatIndex === hero.beats.length - 1) ? 'Complete Story 🏆' : 'Next Beat ›';

    // Beat Titles
    m.querySelector('#story-beat-badge').textContent = `Beat ${this.currentBeatIndex + 1} of 5`;
    const perspLabels = {
      robot: 'The Robot (Curious Explorer)',
      engineer: 'The Engineer (Hardware & Telemetry)',
      scientist: 'The Scientist (Geology & Discovery)',
      mission_control: 'Mission Control (Flight Director)',
      explorer: 'Future Astronaut (Looking Back)'
    };
    m.querySelector('#story-persp-badge').textContent = `Perspective: ${perspLabels[this.currentPerspective]}`;
    m.querySelector('#story-beat-title').textContent = beat.title;
    m.querySelector('#story-beat-subtitle').textContent = beat.subtitle;

    this.updateVoiceIndicatorUI();

    // Spoken Text
    const narrativeBlock = beat[this.currentPerspective] || beat['robot'];
    const text = narrativeBlock[this.currentAgeBand] || narrativeBlock['cadet'] || narrativeBlock['explorer'];

    // Wrap sentences in clickable spans for teleprompter highlighting & click-to-speak
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const html = sentences.map((s, idx) => `<span class="teleprompter-sentence" id="sentence-${idx}" data-sentence="${idx}" title="Click to hear this sentence">${s.trim()} </span>`).join('');
    m.querySelector('#story-spoken-text').innerHTML = html;

    // Attach click-to-speak listeners to every sentence
    m.querySelectorAll('.teleprompter-sentence').forEach(el => {
      el.addEventListener('click', () => {
        const sentenceText = el.textContent.trim();
        this.speakSingleSentence(sentenceText, el);
      });
    });

    // Render Beat Decision Challenge
    this.renderChallenge(beat.challenge);

    // Render Dossier Drawer
    this.renderDossier(beat.dossier);
  }

  renderChallenge(challenge) {
    const m = this.modal;
    const promptEl = m.querySelector('#challenge-prompt-text');
    const optionsRow = m.querySelector('#challenge-options-row');
    const feedbackBox = m.querySelector('#challenge-feedback-box');

    if (!challenge) {
      m.querySelector('#story-challenge-card').style.display = 'none';
      return;
    }

    m.querySelector('#story-challenge-card').style.display = 'block';
    promptEl.textContent = challenge.prompt;
    feedbackBox.style.display = 'none';
    feedbackBox.innerHTML = '';

    optionsRow.innerHTML = challenge.options.map((opt, idx) => `
      <button class="challenge-opt-btn" data-opt-idx="${idx}">
        ${opt.text}
      </button>
    `).join('');

    optionsRow.querySelectorAll('.challenge-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-opt-idx'), 10);
        const chosen = challenge.options[idx];
        optionsRow.querySelectorAll('.challenge-opt-btn').forEach(b => b.classList.remove('selected', 'correct', 'incorrect'));
        btn.classList.add('selected');
        btn.classList.add(chosen.correct ? 'correct' : 'incorrect');

        feedbackBox.style.display = 'block';
        feedbackBox.className = `challenge-feedback-box ${chosen.correct ? 'feedback-success' : 'feedback-warning'}`;
        feedbackBox.innerHTML = `
          <div class="feedback-badge">${chosen.correct ? '✅ Mission Success!' : '⚠️ Engineering Takeaway:'}</div>
          <p>${chosen.feedback}</p>
        `;

        this.playChimeSFX(chosen.correct);
      });
    });
  }

  renderDossier(dossier) {
    const m = this.modal;
    const drawer = m.querySelector('#dossier-drawer-content');
    const arrow = m.querySelector('.dossier-arrow');

    if (!dossier) {
      m.querySelector('#story-dossier-card').style.display = 'none';
      return;
    }

    m.querySelector('#story-dossier-card').style.display = 'block';
    drawer.style.display = 'none'; // closed by default
    arrow.textContent = '▾';

    m.querySelector('#dossier-title').textContent = dossier.title;
    m.querySelector('#dossier-fact').textContent = dossier.secretFact;
    m.querySelector('#dossier-telemetry-val').textContent = dossier.telemetry;
  }

  /* ===================== WEB SPEECH VOICE ENGINE ===================== */
  speakCurrentBeat() {
    if (!this.synth) {
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('Speech synthesis not supported in this browser. You can read the teleprompter above!', '📢', 3500);
      }
      return;
    }

    this.stopVoice();

    const hero = this.heroStories[this.currentHeroId];
    const beat = hero.beats[this.currentBeatIndex];
    const narrativeBlock = beat[this.currentPerspective] || beat['robot'];
    const fullText = narrativeBlock[this.currentAgeBand] || narrativeBlock['cadet'] || narrativeBlock['explorer'];

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = this.speechRate || 1.0;

    // Pick best voice
    const bestVoice = this.getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Feminine natural tone calibration
    if (this.narratorGender === 'female') {
      utterance.pitch = (this.currentAgeBand === 'cadet') ? 1.25 : 1.15;
    } else {
      utterance.pitch = 0.92;
    }

    // Sentence highlight tracking
    const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
    let currentSentenceIndex = 0;

    utterance.onboundary = (e) => {
      if (e.name === 'sentence') {
        this.highlightSentence(currentSentenceIndex);
        currentSentenceIndex++;
      }
    };

    utterance.onstart = () => {
      this.isPlayingVoice = true;
      this.updateVoiceButtonUI(true);
      this.highlightSentence(0);
    };

    utterance.onend = () => {
      this.stopVoice();
      if (this.currentBeatIndex < hero.beats.length - 1) {
        if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast(`Beat ${this.currentBeatIndex + 1} complete! Click 'Next Beat' to advance your journey.`, '🚀', 3000);
        }
      }
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis error:', err);
      this.stopVoice();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  speakSingleSentence(text, spanEl) {
    if (!this.synth) return;
    this.stopVoice();

    this.clearSentenceHighlight();
    if (spanEl) spanEl.classList.add('active-spoken');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate || 1.0;
    const bestVoice = this.getBestVoice();
    if (bestVoice) utterance.voice = bestVoice;
    utterance.pitch = (this.narratorGender === 'female') ? 1.2 : 0.95;

    utterance.onstart = () => {
      this.isPlayingVoice = true;
      this.updateVoiceButtonUI(true);
    };
    utterance.onend = () => {
      this.stopVoice();
    };
    utterance.onerror = () => {
      this.stopVoice();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopVoice() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlayingVoice = false;
    this.currentUtterance = null;
    this.updateVoiceButtonUI(false);
    this.clearSentenceHighlight();
  }

  updateVoiceButtonUI(isPlaying) {
    const btn = this.modal?.querySelector('#btn-story-play-voice');
    const wave = this.modal?.querySelector('#audio-wave-bars');
    if (!btn) return;

    const voiceName = (this.narratorGender === 'female') ? 'Female Voice' : 'Male Voice';
    if (isPlaying) {
      btn.innerHTML = `<span class="master-play-icon">⏸</span> <span class="master-play-text">Pause Story (${voiceName})</span>`;
      btn.classList.add('playing');
      if (wave) wave.classList.add('active');
    } else {
      btn.innerHTML = `<span class="master-play-icon">▶</span> <span class="master-play-text">Narrate Story (${voiceName})</span>`;
      btn.classList.remove('playing');
      if (wave) wave.classList.remove('active');
    }
  }

  highlightSentence(index) {
    const m = this.modal;
    if (!m) return;
    m.querySelectorAll('.teleprompter-sentence').forEach((el, idx) => {
      el.classList.toggle('active-spoken', idx === index);
    });
  }

  clearSentenceHighlight() {
    const m = this.modal;
    if (!m) return;
    m.querySelectorAll('.teleprompter-sentence').forEach(el => el.classList.remove('active-spoken'));
  }

  /* ===================== WEB AUDIO SYNTHESIZERS & SOUNDBOARD ===================== */
  initAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  startAmbientCosmicHum() {
    if (!this.ambientEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioContext) return;
      if (this.ambientSoundNode) return;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, this.audioContext.currentTime);

      gain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.015, this.audioContext.currentTime + 3);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      this.ambientSoundNode = osc;
    } catch (e) {
      console.warn('AudioContext ambient failed:', e);
    }
  }

  playBlastoffSFX() {
    try {
      this.initAudioContext();
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const t = ctx.currentTime;

      // Rocket countdown beeps
      [0, 0.4, 0.8].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 2 ? 1760 : 880, t + offset);
        g.gain.setValueAtTime(0.08, t + offset);
        g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.16);
      });

      // Rocket engine rumble noise
      const bufferSize = ctx.sampleRate * 2.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, t + 1.1);
      filter.frequency.exponentialRampToValueAtTime(600, t + 2.0);
      filter.frequency.exponentialRampToValueAtTime(80, t + 3.5);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.001, t + 1.1);
      rumbleGain.gain.exponentialRampToValueAtTime(0.2, t + 1.8);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 3.5);

      noise.connect(filter);
      filter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);

      noise.start(t + 1.1);
      noise.stop(t + 3.6);

      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('🚀 3... 2... 1... LIFTOFF! Saturn & Delta II propulsion roaring!', '🔥', 3000);
      }
    } catch (e) {}
  }

  playWindSFX() {
    try {
      this.initAudioContext();
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const t = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 3.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 4.0;
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.exponentialRampToValueAtTime(650, t + 1.2);
      filter.frequency.exponentialRampToValueAtTime(280, t + 2.8);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.9);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
      noise.stop(t + 3.0);

      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('🌪️ Martian Wind: Whispering through Jezero Crater at 25 km/h.', '🔴', 3000);
      }
    } catch (e) {}
  }

  playWakeupMelodySFX() {
    try {
      this.initAudioContext();
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const t = ctx.currentTime;

      // Beautiful morning arpeggio: C5, E5, G5, C6, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.16);

        g.gain.setValueAtTime(0.001, t + idx * 0.16);
        g.gain.linearRampToValueAtTime(0.1, t + idx * 0.16 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.16 + 0.28);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t + idx * 0.16);
        osc.stop(t + idx * 0.16 + 0.3);
      });

      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('📻 Good morning, Opportunity! Beaming morning wake-up song via DSN.', '☀️', 3000);
      }
    } catch (e) {}
  }

  playLaserSFX() {
    try {
      this.initAudioContext();
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const t = ctx.currentTime;

      // 3 rapid laser zap chirps
      [0, 0.12, 0.24].forEach((offset) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2600, t + offset);
        osc.frequency.exponentialRampToValueAtTime(220, t + offset + 0.08);

        g.gain.setValueAtTime(0.15, t + offset);
        g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.09);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.1);
      });

      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('🔴 SuperCam Laser Zapping Target: Plasma flash spectrum captured!', '⚡', 3000);
      }
    } catch (e) {}
  }

  playAirbagBoingSFX() {
    try {
      this.initAudioContext();
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const t = ctx.currentTime;

      // Rubber pitch bend boing
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(360, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.35);

      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);

      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('🎈 BOING! 24 pressurized airbags rebounding across Eagle Crater bedrock!', '🚀', 3000);
      }
    } catch (e) {}
  }

  playChimeSFX(isSuccess) {
    try {
      this.initAudioContext();
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const t = ctx.currentTime;

      if (isSuccess) {
        // High harmonic victory chime
        [587.33, 880, 1174.66].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t + idx * 0.1);
          g.gain.setValueAtTime(0.1, t + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.3);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.32);
        });
      } else {
        // Gentle caution tone
        [329.63, 293.66].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t + idx * 0.15);
          g.gain.setValueAtTime(0.1, t + idx * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 0.25);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(t + idx * 0.15);
          osc.stop(t + idx * 0.15 + 0.28);
        });
      }
    } catch (e) {}
  }

  playPerspectiveSwitchBeep() {
    try {
      this.initAudioContext();
      if (!this.audioContext) return;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + 0.1);
    } catch (e) {}
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.storyMode = new StoryModeController();
});
