/**
 * Space Archaeologists - Voice Storytelling Room & Hero Story Engine
 * Implements:
 *  - 5-Beat Narrative Arc for every hero mission (Launch, Journey, Challenge, Discovery, Legacy)
 *  - 5 Perspectives: The Robot, The Engineer, The Scientist, Mission Control, Future Explorer
 *  - 3 Age Bands: Cadet (6-8), Explorer (9-11), Commander (12-14)
 *  - Full Web Speech Voice Narration with real-time subtitle teleprompter & audio waveform visualizer
 *  - Interactive Web Audio telemetry sound effects (cosmic hum, carrier beep)
 */

class StoryModeController {
  constructor() {
    this.modal = null;
    this.currentHeroId = 'opportunity';
    this.currentBeatIndex = 0;
    this.currentPerspective = 'robot'; // 'robot', 'engineer', 'scientist', 'mission_control', 'explorer'
    this.currentAgeBand = 'explorer'; // 'cadet', 'explorer', 'commander'
    this.isPlayingVoice = false;
    this.synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.audioContext = null;
    this.ambientSoundNode = null;
    this.ambientEnabled = true;

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
            robot: {
              cadet: "I was born in California. People in white suits built me. My wheels were tiny, but my dream was huge. They hoped I would roll for 90 days on Mars!",
              explorer: "On July 7, 2003, a Delta II rocket shot me into the dark. Engineers built me to survive just 90 Martian days (sols). They told me to find signs of ancient water.",
              commander: "Constructed at NASA JPL, Opportunity (MER-B) was designed as a 185-kg solar-powered geological field scout. Mission success criteria called for 90 sols of operation and 600 meters of total traverse."
            },
            engineer: {
              cadet: "We packed twin rovers into rocket noses with giant airbags. We crossed our fingers and watched the rocket fire into the sky!",
              explorer: "We designed Oppy with rocker-bogie suspension and triple-junction solar cells. If dust settled on her panels after 90 days, her heaters would freeze. We had to move fast.",
              commander: "The primary design challenge was thermal and power margins. With 140W peak solar output at Meridiani, orbital dust decay models predicted fatal power loss by Sol 100 without active cleaning."
            },
            scientist: {
              cadet: "We looked through telescopes and saw a gray patch on Mars. We wondered: did Mars once have oceans and lakes like Earth?",
              explorer: "Orbital spectrometers showed gray hematite—a mineral that almost always forms in liquid water. We targeted Eagle Crater to see if Mars was once wet and warm.",
              commander: "Targeting Meridiani Planum was driven by MGS TES detection of crystalline hematite. We posed the critical question: was the hematite formed by hydrothermal volcanism or standing surface water?"
            },
            mission_control: {
              cadet: "We counted down together: Three, two, one, blastoff! Everyone cheered as the rocket zoomed into space.",
              explorer: "Liftoff from Cape Canaveral at 03:18 UTC! For seven months, our navigation team beamed trajectory corrections as Opportunity sped across 283 million miles of empty space.",
              commander: "Trajectory correction maneuvers TCM-1 through TCM-4 executed with less than 0.1% delta-v residual error. Flight dynamics confirmed target atmospheric entry corridor over Meridiani."
            },
            explorer: {
              cadet: "If you visit Earth Museum one day, you will see blueprints of a rover that flew across the stars to touch red dust.",
              explorer: "Looking at the mission archives, you realize Opportunity was an ambassador of human curiosity, launched before smartphones even existed.",
              commander: "Centuries from now, historians will view the 2003 MER campaign as humanity's decisive step from passive orbital reconnaissance to active surface geology."
            }
          },
          {
            title: 'Beat 2: The Bouncing Landing & The Hole-in-One',
            subtitle: 'A 240-million-mile golf shot into Eagle Crater',
            robot: {
              cadet: "I hit Mars wrapped in giant bubble balloons! Boing, boing, boing! When I stopped rolling, I was inside a tiny crater. A hole in one!",
              explorer: "On January 25, 2004, I plunged into the Martian sky. My parachutes snapped open, rockets fired, and airbags wrapped me as I bounced 30 times straight into Eagle Crater.",
              commander: "Entry, Descent, and Landing (EDL) utilized a radar altimeter, transverse propulsion rockets (TIRS), and 24 pressurized airbags. The lander came to rest in the 22-meter depression of Eagle Crater."
            },
            engineer: {
              cadet: "The balloons bounced 30 feet in the air! We were biting our nails until the radio beeped: Oppy was safe and sound!",
              explorer: "The radio signal went silent during the bounces. Then—carrier lock! The petal doors unfolded, the cameras deployed, and Oppy stared at exposed bedrock for the first time in Mars history.",
              commander: "EDL telemetry recorded 18G peak deceleration on entry. Airbag deflation and petal retraction executed nominally, orienting the rover on a 15-degree interior crater slope."
            },
            scientist: {
              cadet: "Look at those rocks! Right outside the rover was a wall of gray layers. Mars was showing us its secret diary!",
              explorer: "Rovers usually land in flat boring dust. Oppy rolled right into an impact crater surrounded by bedrock! We called it an interplanetary hole-in-one.",
              commander: "Landing inside Eagle Crater provided immediate access to pristine layered sulfate bedrock without traversing kilometers of dusty regolith. Nature handed us a geological outcrop on day one."
            },
            mission_control: {
              cadet: "Our monitors showed green lights! People threw papers in the air and hugged. Oppy was on Mars!",
              explorer: "Flight director announced touchdown at 05:05 UTC. We queued the mission wake-up song: 'Straight to the Moon' by The Flaming Lips. Mars exploration would never be the same.",
              commander: "Deep Space Network station Madrid acquired 8.4 GHz X-band carrier. Signal-to-noise ratio confirmed omnidirectional antenna transmission with zero thermal anomalies."
            },
            explorer: {
              cadet: "Standing on the rim of Eagle Crater today, you can still see the little dent where Oppy's airbags first bounced.",
              explorer: "Eagle Crater is tiny—only 72 feet across. To hit that exact bullseye from 240 million miles away was pure engineering brilliance.",
              commander: "The Eagle Crater landing site represents one of the most serendipitous touchdown coordinates in the annals of space exploration, jumpstarting modern Martian stratigraphy."
            }
          },
          {
            title: 'Beat 3: Blueberries & The Ancient Salty Lake',
            subtitle: 'Microscopic discoveries that proved Mars had water',
            robot: {
              cadet: "I looked at the ground with my magnifying glass eye. Look! Tiny gray balls everywhere! The scientists called them blueberries!",
              explorer: "I used my microscopic camera and found billions of tiny ball-shaped stones. They weren't fruit—they were hematite spheres created inside ancient salty water!",
              commander: "My Microscopic Imager and Mössbauer Spectrometer resolved millimeter-scale hematite concretions ('blueberries') embedded in jarosite-rich sulfate matrix, proving persistent groundwater."
            },
            engineer: {
              cadet: "We built a tiny rock grinder on her robot arm. It carved circles in rocks to smell what was inside!",
              explorer: "Our Rock Abrasion Tool (RAT) drilled into the rock named 'El Capitan'. We proved the rock was full of sulfate salts left behind when an ocean evaporated.",
              commander: "The RAT diamond-tipped grinding head excavated 5 mm deep into the 'El Capitan' outcrop. Alpha Particle X-Ray Spectrometer confirmed massive concentrations of sulfur, chlorine, and bromine."
            },
            scientist: {
              cadet: "Water! Mars had real liquid water you could splash in! It was salty and warm billions of years ago.",
              explorer: "We found cross-bedding in the sand ripples—the exact patterns you see at the bottom of streams on Earth. Opportunity proved Mars was once habitable!",
              commander: "The sedimentological evidence was conclusive: subaqueous festoon cross-bedding generated by flowing ripples in a shallow, acidic hyper-saline lake bed during the late Noachian period."
            },
            mission_control: {
              cadet: "We held a giant press conference: 'Mars was once soaking wet!' The whole world celebrated with us.",
              explorer: "On March 23, 2004, NASA held an emergency briefing. We officially announced that liquid water had bathed the surface of Meridiani Planum for extended geological epochs.",
              commander: "Peer-reviewed publication in Science verified that Opportunity fulfilled its primary science charter within Sol 60, well ahead of the 90-sol design envelope."
            },
            explorer: {
              cadet: "When you walk on Mars, look down at your boots. Those little gray marbles are clues from an ancient sea.",
              explorer: "Millions of hematite blueberries still coat the plains of Meridiani. They are nature's memory of a wet, living planet that dried up billions of years ago.",
              commander: "The Meridiani blueberries stand as monumental proof of Martian paleohydrology, preserved for 3.7 billion years in a freeze-dried planetary time capsule."
            }
          },
          {
            title: 'Beat 4: The 28-Mile Marathon & The Sand Traps',
            subtitle: 'Surviving 5,000 Martian sunrises and driving across craters',
            robot: {
              cadet: "My 90 days were up, but I didn't stop! I kept driving. Year after year, crater after crater, I drove farther than a marathon!",
              explorer: "Wind gusts unexpectedly blew dust off my solar panels, giving me fresh power! I drove 28.06 miles (45.16 kilometers)—the off-world driving record that stood for decades.",
              commander: "Enabled by serendipitous atmospheric dust-cleaning events ('cleaning events'), my operational lifespan extended from 90 sols to 5,111 sols, traversing Victoria and Endeavour craters."
            },
            engineer: {
              cadet: "Her front right wheel got stuck in a sand dune! We built a sandbox in California to test how to wiggle her out.",
              explorer: "In 2005, Oppy got bogged down in Purgatory Dune for five weeks! We recreated the sand dune in our JPL laboratory, tested escape tracks, and drove her out backwards.",
              commander: "At Purgatory Dune, wheel slip reached 100%. We developed automated hazard avoidance software patches and blind-drive traction protocols that enabled Oppy to conquer 45 km of rugged terrain."
            },
            scientist: {
              cadet: "She found a giant meteorite from outer space lying on Mars! The first meteorite ever found on another world.",
              explorer: "At Endurance Crater, Oppy discovered 'Heat Shield Rock'—an iron-nickel meteorite that crashed onto Mars. She also surveyed clay minerals that formed in fresh, drinkable water.",
              commander: "At Endeavour Crater's rim, Opportunity sampled smectite clay minerals at Cape York, indicating a neutral pH environment drastically different from the acidic waters of Meridiani."
            },
            mission_control: {
              cadet: "Every morning for 14 years, our team sent Oppy a good morning song: Beatles, Queen, and Star Wars music!",
              explorer: "Generations of engineers grew up, got married, and raised kids while Opportunity kept driving. She became a beloved member of thousands of human families across Earth.",
              commander: "Over 5,000 tactical planning cycles were completed. Commands beamed via Deep Space Network uplink 70-meter antennas at Goldstone, Canberra, and Madrid without interruption."
            },
            explorer: {
              cadet: "Her tire tracks stretch across Mars for miles and miles, like a dotted line through red sand dunes.",
              explorer: "No human has ever walked a marathon on another planet. A little robotic cart did it first, humming quietly under alien stars.",
              commander: "Opportunity's 45.16-kilometer odometer track remains an indelible monument of early 21st-century interplanetary mobility engineering."
            }
          },
          {
            title: 'Beat 5: The Darkness, Silence & Eternal Legacy',
            subtitle: 'Perseverance Valley and the last song from Earth',
            robot: {
              cadet: "A giant dust storm covered the sky. The Sun disappeared. My battery grew cold. I curled up and went to sleep in Perseverance Valley.",
              explorer: "In June 2018, a planet-encircling dust storm blotted out the Sun. On Sol 5,111, my power dropped to 22 watt-hours. My last telemetry read: 'My battery is low and it's getting dark.'",
              commander: "Atmospheric opacity (tau) exceeded 10.8 on Sol 5111. With insufficient insolation to power the survival clock heaters, Opportunity entered low-power sleep in Perseverance Valley."
            },
            engineer: {
              cadet: "We called her radio for eight months: 'Oppy, wake up!' We never gave up until the very last whisper.",
              explorer: "For 240 days, we beamed over a thousand recovery commands to Mars. On February 12, 2019, we played our final song: 'I'll Be Seeing You' by Billie Holiday. Mars stayed silent.",
              commander: "After 833 recovery attempts via Deep Space Network and multiple sweeping passes by Mars Reconnaissance Orbiter, NASA officially concluded the MER mission on February 13, 2019."
            },
            scientist: {
              cadet: "She showed us Mars was alive with water. She is a pioneer who taught humanity how to explore the universe.",
              explorer: "Opportunity rewrote our textbooks. She proved Mars was once warm, wet, and habitable. Every rover that came after—Curiosity, Perseverance—stands on her shoulders.",
              commander: "Opportunity transformed planetary science from remote observational astronomy into ground-truth comparative planetology, providing definitive benchmarks for ancient Martian habitability."
            },
            mission_control: {
              cadet: "People in the control room cried and hugged. We were sad she was silent, but so proud of what she did.",
              explorer: "Project manager John Callas stood at the podium with tears in his eyes: 'To the rover that did, to the team that made it happen: mission complete. Well done.'",
              commander: "Final mission sign-off was transmitted from JPL Mission Control Room at 19:00 PST. The room rose in a five-minute standing ovation for 15 years of uninterrupted operational excellence."
            },
            explorer: {
              cadet: "One day, astronaut boots will crunch through the dust of Perseverance Valley. Someone will wipe the sand off her camera eye and whisper: 'Thank you, Oppy.'",
              explorer: "Opportunity rests in Perseverance Valley, looking out over Endeavour Crater. She is not lost. She is waiting for the first humans she guided to Mars.",
              commander: "A future Martian heritage sanctuary will preserve Opportunity exactly where she rests—a timeless golden compass marking the dawn of humanity's multi-planetary era."
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
            robot: {
              cadet: "I had four golden legs and a rocket engine in my belly! My job was to carry Neil and Buzz down to the dusty Moon.",
              explorer: "In May 1961, President Kennedy pledged to land humans on the Moon before the decade was out. In July 1969, Lunar Module LM-5 'Eagle' stood atop a 363-foot Saturn V rocket.",
              commander: "Built by Grumman Aerospace in Bethpage, New York, the Apollo Lunar Module was humanity's first true crewed spacecraft, engineered solely to operate in the vacuum of space."
            },
            engineer: {
              cadet: "We made the spacecraft walls as thin as three sheets of aluminum foil to save weight!",
              explorer: "Every ounce mattered. We removed seats so astronauts stood up during descent. We wrapped the descent stage in 25 layers of gold Mylar foil to shield against 250-degree lunar heat.",
              commander: "The Descent Propulsion System (DPS) utilized hypergolic aerozine 50 and nitrogen tetroxide with variable mechanical throttling (10% to 60%), an unprecedented aerospace propulsion feat."
            },
            scientist: {
              cadet: "What was the Moon made of? Would the spaceship sink into dust? Nobody knew until we touched it!",
              explorer: "Astronomers debated whether the Moon was covered in a deep sea of powdery dust that would swallow a spacecraft. We needed hard samples to date the age of the solar system.",
              commander: "Primary scientific objectives centered on collecting pristine regolith and basalt samples from Mare Tranquillitatis to test planetary accretion models and calibrate crater-counting chronologies."
            },
            mission_control: {
              cadet: "Houston, we are go for launch! The ground shook for miles around.",
              explorer: "On July 16, 1969, 7.5 million pounds of thrust lifted Apollo 11 from Pad 39A. CapCom Charlie Duke monitored heart rates: Neil's was 110 beats per minute at liftoff.",
              commander: "Translunar Injection (TLI) burn placed Apollo 11 on a free-return trajectory. CSM Columbia and LM Eagle separated on lunar orbit rev 13 after nominal checkout."
            },
            explorer: {
              cadet: "Tranquility Base is the most famous camping spot in human history!",
              explorer: "When you look up at the crescent Moon through a telescope, the Sea of Tranquility looks smooth and peaceful. That is where humanity first stepped off the home planet.",
              commander: "The physical hardware at Tranquility Base represents the pinnacle of 20th-century geopolitical and engineering mobilization."
            }
          },
          {
            title: 'Beat 2: The 25-Second Touchdown & Alarm 1202',
            subtitle: 'Computer overload and dodging boulders in West Crater',
            robot: {
              cadet: "My rocket engine roared: Psshhhh! Below me, giant sharp rocks waited. Neil took the joystick and steered us past the dangerous boulders!",
              explorer: "During final descent, the computer sounded a 1202 program alarm—it was overloaded! Neil looked out the window and saw Eagle was heading straight for a crater full of car-sized boulders.",
              commander: "The Apollo Guidance Computer (AGC) suffered radar-counter cycle stealing (1202/1201 alarm). Neil Armstrong assumed manual semi-automatic attitude hold (P66) to clear West Crater boulder ejecta."
            },
            engineer: {
              cadet: "The fuel tank gauge was dropping: 60 seconds... 30 seconds... 20 seconds! We were holding our breath!",
              explorer: "Neil hovered horizontally searching for a safe flat patch. In Houston, flight controllers watched the descent propellant gauge tick below 3%. At 25 seconds of fuel left, contact lights lit!",
              commander: "Touchdown was recorded at 20:17:40 UTC on July 20, 1969. Post-mission fuel reconstruction confirmed approximately 45 seconds of usable DPS propellant remained before abort staging."
            },
            scientist: {
              cadet: "The dust flew away in straight lines because there is no air on the Moon to make clouds!",
              explorer: "Rocket exhaust blew lunar dust outward like sheets of light. The footpads touched down softly, sinking only 2 inches into the soil. The surface was firm and solid!",
              commander: "Lunar surface bearing capacity was confirmed at 0.5 to 1.5 kg/cm², disproving the controversial 'dust sinkhole' hypothesis and validating Surveyor probe telemetry."
            },
            mission_control: {
              cadet: "'Houston, Tranquility Base here. The Eagle has landed!' Everyone screamed with joy!",
              explorer: "Charlie Duke exhaled into his microphone: 'Roger, Tranquility, we copy you on the ground. You got a bunch of guys about to turn blue. We're breathing again. Thanks a lot!'",
              commander: "Telemetry confirmation of Lunar Contact: probe switches on 3 landing footpads closed. DPS engine shutdown confirmed 1.5 seconds later to prevent over-pressurization back-blast."
            },
            explorer: {
              cadet: "That golden stage sat down so gently that the ladder didn't even bend.",
              explorer: "The landing pad sits on a flat dusty plain at 0.67408° N, 23.47297° E. For 57 years, no breeze has disturbed a single grain of dust around it.",
              commander: "The landing coordinate marks the exact physical terminus of humanity's initial terrestrial quarantine."
            }
          },
          {
            title: 'Beat 3: Footprints & The Scientific Mirror',
            subtitle: 'Leaving behind a laser reflector that works to this day',
            robot: {
              cadet: "Buzz Aldrin pulled a shiny mirror suitcase out of my side and set it in the dust. Scientists on Earth still shoot green lasers at it!",
              explorer: "Before leaving, Neil and Buzz deployed the EASEP: a passive seismometer and the Laser Ranging Retroreflector (LRRR)—a panel of 100 fused silica corner-cube prisms.",
              commander: "The Apollo 11 EASEP payload contained the PSEP seismometer and the 100-prism LRRR. It required zero electrical power, designed as a 100% passive optical target."
            },
            engineer: {
              cadet: "Each glass cube bounces light straight back to where it came from, even if it hits at an angle!",
              explorer: "Engineers cut corner-cube prisms so that any incoming light ray reflects internally three times and shoots back exactly 180 degrees toward the sender on Earth.",
              commander: "Thermal distortion tolerances on the suprasil quartz prisms were held to 0.2 arcseconds under 300K temperature swings between lunar day and lunar night."
            },
            scientist: {
              cadet: "By timing the laser flash, we proved the Moon is creeping away from Earth by 1.5 inches every year!",
              explorer: "For over 55 years, McDonald Observatory and Côte d'Azur have fired pulsed lasers at Tranquility Base. By timing the round trip down to picoseconds, we measure Earth-Moon distance to millimeter precision!",
              commander: "Lunar Laser Ranging (LLR) verified the Weak Equivalence Principle of General Relativity to 1 part in 10^14 and proved lunar orbital recession of 3.82 ± 0.07 cm/year due to tidal dissipation."
            },
            mission_control: {
              cadet: "We watched on black-and-white television as Neil climbed down the ladder: 'One small step for man...'",
              explorer: "650 million people watched live on Earth. Neil read the plaque bolted to my front landing leg: 'Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind.'",
              commander: "EVA duration lasted 2 hours, 31 minutes. 21.55 kg of lunar samples were stowed in rock boxes. Plaque unveiled on forward gear strut leg between ladders."
            },
            explorer: {
              cadet: "The laser reflector sits quietly on the Moon right now, catching laser beams from telescopes on Earth tonight!",
              explorer: "Of all the machines humanity has left behind, the Apollo retroreflectors are the only equipment that still produces active scientific data on an everyday basis.",
              commander: "The Apollo 11 LRRR represents an unbroken multi-generational bridge of scientific observation linking Apollo-era physics directly to contemporary gravitational mechanics."
            }
          },
          {
            title: 'Beat 4: The Ascent Stage Blasts Off',
            subtitle: 'Using the golden stage as a launchpad to return home',
            robot: {
              cadet: "KA-BOOM! The astronauts pushed the launch button. Their cabin flew up into the stars, and left my golden legs behind as their launch pad!",
              explorer: "To escape lunar gravity, the Lunar Module split in half. Explosive guillotine blades sliced the cables, and the ascent engine fired right off the top of the descent stage.",
              commander: "Ascent stage separation utilized pyrotechnic nut cutters to sever four structural interstage studs and a guillotine knife for electrical umbilicals, with the APS generating 15.6 kN thrust."
            },
            engineer: {
              cadet: "We designed the golden base to stay behind because every pound left on the Moon saved rocket fuel to reach Earth!",
              explorer: "The descent stage had done its job: it kept them alive, provided oxygen and water, and gave them a stable launch platform. Leaving it behind was the key to getting them home alive.",
              commander: "Mass optimization dictated leaving 2,034 kg of descent stage dry mass on the surface, ensuring the ascent stage achieved the 1,840 m/s delta-v required for CSM rendezvous."
            },
            scientist: {
              cadet: "They brought home rocks that were 3.7 billion years old—older than any rock you can pick up on Earth!",
              explorer: "The 47 pounds of Moon rocks Neil and Buzz scooped up contained titanium-rich ilmenite and armalcolite (named after Armstrong, Aldrin, and Collins). They proved the Moon was once a sea of magma.",
              commander: "Petrological analysis of Apollo 11 basalts established the Lunar Magma Ocean hypothesis, proving that the ancient Moon melted completely and stratified into an anorthositic crust."
            },
            mission_control: {
              cadet: "'Houston, we are rendezvoused and docked!' The astronauts were safe with their friend in the mothership.",
              explorer: "Ascent stage docked with Columbia. Neil, Buzz, and Michael Collins hugged. Eagle was jettisoned into lunar orbit—its final resting place is still an unsolved astronomical mystery.",
              commander: "LM jettison confirmed at 23:41 UTC on July 21. Recent gravitational perturbation modeling by Meador (2021) suggests Eagle's ascent stage may still remain in quasi-stable lunar orbit."
            },
            explorer: {
              cadet: "Look at the four golden pads standing in the gray dirt. The launch pad that launched humanity into the cosmic future.",
              explorer: "Tranquility Base is untouched. The flag blew over during liftoff, but the descent stage, the boots prints, the camera, and the laser mirror stand exactly as they were left.",
              commander: "Tranquility Base is protected by international space heritage protocols as the premier archaeological site of the Anthropocene epoch."
            }
          },
          {
            title: 'Beat 5: The Silent Shrine of Mankind',
            subtitle: '57 years in vacuum: preserved for millions of years',
            robot: {
              cadet: "I don't rust. I don't get rained on. I will stay on the Moon for a million years, shining in the sunshine!",
              explorer: "Because the Moon has no wind, rain, or atmosphere, there is no weather to erode hardware. The Apollo 11 descent stage will look virtually identical 100,000 years from now.",
              commander: "Without atmospheric oxidation or hydrological weathering, mechanical degradation is restricted to micrometeorite bombardment (10^-6 mm/yr) and solar UV radiation peeling thermal foils."
            },
            engineer: {
              cadet: "We built it to last 4 days. It will last longer than the Pyramids of Egypt!",
              explorer: "The gold Kapton blankets have crinkled from solar heating, and micrometeorites have peppered the foil, but the titanium frame and stainless steel plaque remain intact.",
              commander: "Structural titanium 6Al-4V struts and Inconel heat shielding possess tensile stability projected to endure beyond 500,000 years in the cislunar thermal cycling regime."
            },
            scientist: {
              cadet: "In 2009, the LRO spacecraft in lunar orbit took a photo from space: you can see my shadow and Neil's footpaths!",
              explorer: "NASA's Lunar Reconnaissance Orbiter dipped within 15 miles of the Moon and photographed Tranquility Base. Neil's dark bootpath to Little West Crater is clearly visible from space.",
              commander: "LROC Narrow Angle Camera frame M175629160RE resolved the descent stage at 0.5-meter/pixel resolution, clearly distinguishing the four landing footpad shadows and the EASEP station."
            },
            mission_control: {
              cadet: "Every time a kid looks at the Moon at night, they are looking at our little golden spaceship.",
              explorer: "Tranquility Base showed what humanity can achieve when we unite around a bold peaceful dream. It was not the end of the journey—it was the very beginning.",
              commander: "Tranquility Base remains the gold standard of system engineering reliability, risk mitigation, and international scientific ambition."
            },
            explorer: {
              cadet: "One day, you might be the astronaut who visits Tranquility Base. Remember to walk gently!",
              explorer: "When human beings establish permanent cities on the Moon, Tranquility Base will be their national park—a sacred spot where the species first touched another world.",
              commander: "The Apollo 11 site stands as the prime archaeological monument of human civilization's transition from an Earth-bound species to a space-faring civilization."
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
            robot: {
              cadet: "I am the biggest rover ever sent to Mars—the size of a big SUV! On my belly, I carried a baby helicopter named Ingenuity.",
              explorer: "On July 30, 2020, Perseverance launched to search for fossilized microbial life in Jezero Crater—a 28-mile-wide impact crater that once held a 800-foot-deep lake.",
              commander: "The Mars 2020 mission architecture integrated the 1,025-kg Perseverance rover and the 1.8-kg Ingenuity technology demonstration helicopter, targeting Jezero Crater's deltaic clay deposits."
            },
            engineer: {
              cadet: "We hid secret messages in my parachute! The pattern spelled out: 'DARE MIGHTY THINGS' in secret computer code.",
              explorer: "We designed Terrain Relative Navigation (TRN): a system where Percy snapped photos during parachute descent, compared them to orbital hazard maps, and autonomously steered away from boulders.",
              commander: "TRN and Range Trigger technology tightened the landing ellipse to 7.7 x 6.6 km, allowing direct touchdown adjacent to treacherous boulder fields on the Jezero delta front."
            },
            scientist: {
              cadet: "Jezero was a lake fed by a rushing river! If ancient Martian microbes ever existed, their fossils are trapped in the clay.",
              explorer: "Rivers carry mud and organic material and drop them in deltas. On Earth, river deltas are where fossils are best preserved. We went to Jezero to find signs of ancient life.",
              commander: "Spectroscopic detection of smectite and magnesium carbonates in Jezero delta sediment provided optimal conditions for the preservation of biosignatures and organic geochemical markers."
            },
            mission_control: {
              cadet: "Launch in the middle of a pandemic! Everyone cheered from behind their computer screens across the world.",
              explorer: "The launch team overcame unprecedented challenges during 2020. Liftoff aboard an Atlas V 541 occurred with pinpoint trajectory accuracy toward Mars.",
              commander: "Atlas V upper-stage Centaur performed second burn placing the cruise stage into a hyperbolic injection orbit with Earth escape velocity exceeding 11.2 km/s."
            },
            explorer: {
              cadet: "Look closely at Percy's arm—it holds a piece of a Martian meteorite that fell to Earth, brought back home to Mars!",
              explorer: "A piece of Martian basalt blasted off Mars millions of years ago was returned to Mars inside Percy's SHERLOC spectrometer as a calibration target.",
              commander: "Perseverance's return of Sayh al Uhaymir 169 meteorite represents the first interplanetary round-trip artifact in history."
            }
          },
          {
            title: 'Beat 2: The Sky Crane Dance & Touchdown',
            subtitle: 'Seven minutes of terror captured in high-definition video',
            robot: {
              cadet: "A rocket jetpack hovered over Mars, lowered me gently on nylon cables, cut the ropes, and zoomed away into the sunset!",
              explorer: "On February 18, 2021, the sky crane lowered Percy gently onto the dusty floor of Jezero. High-definition cameras recorded the descent in full color—a first in space history!",
              commander: "Powered descent initiated at 2,100 meters altitude. Four steerable hydrazine rocket thrusters stabilized the descent stage, lowering the rover 7.6 meters on triple nylon bridles at 0.75 m/s."
            },
            engineer: {
              cadet: "We put microphones on a spaceship for the first time! We recorded the actual sound of Martian wind whistling.",
              explorer: "For decades, we had only imagined what Mars sounded like. Percy's microphones captured the sound of wind gusts, rover wheels crunching rocks, and laser zap sounds on stones.",
              commander: "SuperCam and EDL microphones captured acoustic frequencies from 20 Hz to 50 kHz, measuring acoustic attenuation and atmospheric speed of sound at 240 m/s in 95% CO₂."
            },
            scientist: {
              cadet: "The landing spot was named after Octavia E. Butler, a famous author who wrote incredible stories about the stars.",
              explorer: "Touchdown was so precise that Percy landed just 1.7 miles from the ancient delta cliff. The rocks under her wheels were igneous volcanic rocks—older than most rocks on Earth!",
              commander: "Post-landing geomorphological analysis established that the crater floor was composed of olivine-bearing basaltic cumulate (Séítah formation) capped by pyroxene-rich lava flows."
            },
            mission_control: {
              cadet: "Swati Mohan announced: 'Touchdown confirmed! Perseverance safely on the surface of Mars!' The whole world erupted in celebration.",
              explorer: "The iconic photograph of the rover suspended on nylon cables beneath the firing sky crane became an instant global sensation. Humanity had arrived at Jezero.",
              commander: "Touchdown telemetry received at 20:55 UTC via Mars Reconnaissance Orbiter UHF relay. All six wheels achieved positive ground contact with zero structural tilt."
            },
            explorer: {
              cadet: "A mile away from Percy, you can find the sky crane crash site—the rocket jetpack that sacrificed itself to save the rover.",
              explorer: "The discarded parachute, backshell, and heat shield were later spotted by Ingenuity flying overhead—archaeological relics of entry scattered across the red sands.",
              commander: "The Jezero EDL debris field represents the most extensively photographed and documented extraterrestrial impact assembly in history."
            }
          },
          {
            title: 'Beat 3: Ingenuity Takes Flight in Alien Skies',
            subtitle: 'The Wright Brothers moment on another planet',
            robot: {
              cadet: "I unfolded my baby helicopter, dropped it on the ground, and backed away. Then its blades spun super fast and IT FLEW!",
              explorer: "On April 19, 2021, Ingenuity spun its twin carbon-fiber blades at 2,400 RPM—five times faster than an Earth helicopter—and rose 10 feet into the thin Martian air!",
              commander: "Mars atmospheric density is only 1% of Earth's (equivalent to 100,000 feet altitude). Counter-rotating coaxial rotors generating 1.2 kW power achieved the first controlled, powered flight on another celestial body."
            },
            engineer: {
              cadet: "We taped a tiny piece of fabric from the Wright Brothers' first 1903 airplane under Ingenuity's solar panel!",
              explorer: "Ingenuity was only designed to fly five times as a test. Instead, it flew 72 times across three years, serving as Percy's aerial scout to spot safe driving routes!",
              commander: "Ingenuity accumulated 128.8 flight minutes over 72 sorties, covering 17.0 km and reaching altitudes of 24 meters, validating autonomous rotorcraft navigation in low Reynolds-number regimes."
            },
            scientist: {
              cadet: "From high in the sky, Ingenuity saw sand traps and river boulders that Percy couldn't see from the ground.",
              explorer: "The helicopter scouted ahead into the treacherous Séítah sand dunes, photographing rock layers from angles no ground rover could ever reach, saving Percy months of travel time.",
              commander: "Aerial reconnaissance enabled targeted trajectory planning through the Margin Unit, identifying ancient carbonate-bearing formations crucial for paleolake shoreline studies."
            },
            mission_control: {
              cadet: "Flight 1, 2, 3... all the way to Flight 72! We named its landing airfields after Wilbur and Orville Wright.",
              explorer: "Every flight pushed the boundaries. On Flight 72 in January 2024, Ingenuity suffered rotor blade damage during a dusty landing. It safely touched down and remains standing upright.",
              commander: "Ingenuity officially retired in January 2024. Its avionics remain operational, logging environmental temperatures and transmitting telemetry to Perseverance as a stationary weather station."
            },
            explorer: {
              cadet: "Ingenuity sits proudly on a gentle sand ripple in Jezero, its four little carbon legs planted in red dust.",
              explorer: "The Wright Brothers flew for 12 seconds in Kitty Hawk; Ingenuity flew for 2 hours on Mars. Two historic machines separated by 140 million miles, forever linked by a scrap of muslin wing fabric.",
              commander: "Ingenuity's final resting site at Valinor Hills constitutes the historic birthplace of extraterrestrial aviation."
            }
          },
          {
            title: 'Beat 4: The Sample Depot at Three Forks',
            subtitle: 'Sealing Martian rocks in golden tubes for a future rocket',
            robot: {
              cadet: "I drilled holes into rocks, pulled out chalk-sized rock tubes, sealed them in shiny titanium, and dropped them on the ground like a treasure hunt!",
              explorer: "Perseverance built the first extraterrestrial sample depot at 'Three Forks'. She drilled 10 duplicate titanium tubes filled with rock, soil, and Martian air, placing them carefully on the ground.",
              commander: "The Three Forks Sample Depot comprises 10 hermetically sealed Grade 5 titanium tubes deposited between December 2022 and January 2023, establishing a redundant cache for Mars Sample Return (MSR)."
            },
            engineer: {
              cadet: "The inside of those tubes is the cleanest place in the solar system! No Earth germs allowed.",
              explorer: "We baked the sample tubes to 660 degrees and cleaned them in sterile chambers. If a future mission brings them home, scientists must be 100% sure any microbes are from Mars, not Earth!",
              commander: "Ultra-clean collection hardware adhered to Category V planetary protection requirements, limiting non-biological organic contaminants to less than 1 ppb per sample."
            },
            scientist: {
              cadet: "We found leopard spots in the rock! In rocks on Earth, these chemical spots are made by ancient microbes living in water.",
              explorer: "In July 2024 at 'Cheyava Falls', Percy discovered rock veins filled with calcium sulfate and covered in tiny 'leopard spots' containing iron phosphate—a potential biosignature of ancient life!",
              commander: "Cheyava Falls mudstone analysis revealed millimetric reaction rims ('leopard spots') containing reduced iron and phosphate, resembling microbial redox reaction signatures found in terrestrial lacustrine strata."
            },
            mission_control: {
              cadet: "AutoNav driving! Percy doesn't even wait for Earth to tell her where to drive—she picks her own path!",
              explorer: "With her advanced AutoNav artificial intelligence, Percy drives autonomously up to 300 meters a day, calculating routes around rocks in real time while human drivers are asleep in California.",
              commander: "Enhanced AutoNav image processing delivers dedicated FPGA path planning, slashing drive deliberation stops to zero and setting the off-world single-day driving record of 347.7 meters."
            },
            explorer: {
              cadet: "Ten golden tubes lying in the sand at Three Forks, waiting for a spaceship from Earth to pick them up.",
              explorer: "Those sample tubes are humanity's message in a bottle. Inside them is the answer to the greatest question ever asked: are we alone in the universe?",
              commander: "The Three Forks depot represents humanity's primary extraterrestrial geological archive, awaiting retrieval by future robotic or crewed Mars Sample Return architecture."
            }
          },
          {
            title: 'Beat 5: Climbing the Rim into Tomorrow',
            subtitle: 'The journey continues past the crater walls',
            robot: {
              cadet: "I am still driving! Right now, my wheels are crunching up the steep crater rim. I have years of exploring left in me!",
              explorer: "In late 2024 and 2025, Perseverance drove out of the Jezero lakebed and began climbing the 1,000-foot crater rim to reach ancient rocks that formed before the lake even existed.",
              commander: "Perseverance's nuclear MMRTG generator possesses an operational half-life extending beyond 2031, providing continuous 110W electrical power for the extended crater rim and Lac de Charmes campaign."
            },
            engineer: {
              cadet: "Her nuclear battery never sleeps. It keeps her warm during freezing -130 degree Martian nights.",
              explorer: "Unlike solar rovers that can be choked by dust storms, Percy's plutonium power source generates heat and electricity day and night, in winter or summer, storm or clear skies.",
              commander: "The MMRTG system supplies steady thermal energy to the internal electronics loop via pumped Freon coolant loops, eliminating the diurnal thermal stress that doomed earlier solar rovers."
            },
            scientist: {
              cadet: "MOXIE made real breathable oxygen out of the thin Martian air! Enough for a small astronaut to breathe for several hours.",
              explorer: "Percy carried MOXIE—a golden toaster-sized machine that sucked in Martian carbon dioxide and turned it into pure oxygen. It proved humans can make their own breathing air on Mars!",
              commander: "MOXIE demonstrated solid oxide electrolysis, producing 122 grams of 98% pure oxygen at 12 g/hr, demonstrating in-situ resource utilization (ISRU) for future crewed ascent vehicles."
            },
            mission_control: {
              cadet: "Every day, fresh photos beam down from Mars. You can look at pictures taken just hours ago!",
              explorer: "Thousands of raw images are published online every day for the public. Anyone on Earth can look through Percy's eyes and explore Mars in real time alongside NASA scientists.",
              commander: "Tactical uplink cycles execute daily over DSN X-band, with downlink data rates achieving up to 2 Mbps through MAVEN, TGO, and Odyssey relay passes."
            },
            explorer: {
              cadet: "Percy is writing history right now. And one day, human astronauts will catch up to her tire tracks.",
              explorer: "When human boots finally step onto Mars, they will follow the trail blazed by Perseverance. She is not just an abandoned machine—she is the forerunner of our species.",
              commander: "Perseverance and Ingenuity stand at the technological vanguard of human planetary migration, transforming Mars from an alien wasteland into our species' second home."
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
  }

  bindGlobalTriggers() {
    // Top HUD trigger
    window.openStoryMode = (heroId = 'opportunity') => {
      this.open(heroId);
    };

    // Listen for custom event
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
            <!-- Age Selector -->
            <div class="story-age-selector" role="radiogroup" aria-label="Select Age Band">
              <span class="age-selector-label">Audience:</span>
              <button class="age-pill-btn" data-age="cadet" title="Ages 6-8: Simple words, short sentences">🐣 Cadet (6-8)</button>
              <button class="age-pill-btn active" data-age="explorer" title="Ages 9-11: Vivid stories, clear science">🚀 Explorer (9-11)</button>
              <button class="age-pill-btn" data-age="commander" title="Ages 12-14: Engineering, telemetry, geology">🛰️ Commander (12-14)</button>
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

            <!-- Active Beat Narrative Display -->
            <article class="story-narrative-article">
              <div class="narrative-meta-badge">
                <span id="story-beat-badge">Beat 1 of 5</span>
                <span id="story-persp-badge">Speaking as: The Robot</span>
              </div>
              <h2 id="story-beat-title">Beat Title</h2>
              <h4 id="story-beat-subtitle">Beat Subtitle</h4>

              <!-- Real-time teleprompter text box with sentence highlighting -->
              <div class="story-teleprompter" id="story-teleprompter">
                <p id="story-spoken-text">Story text loading...</p>
              </div>
            </article>

            <!-- Bottom Audio Player & Voice Controls HUD -->
            <footer class="story-audio-controller">
              <div class="audio-controls-left">
                <!-- Play/Pause Voice Narration -->
                <button id="btn-story-play-voice" class="btn-voice-master" title="Play or pause voice narration">
                  <span class="master-play-icon">▶</span>
                  <span class="master-play-text">Narrate Story</span>
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
        // Last beat reached
        if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast(`🎉 You completed the story of ${hero.name}! Try another perspective or hero mission.`, '🏆', 4000);
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
      }
    });

    // Inspect in 3D stage link
    m.querySelector('#btn-story-inspect-3d').addEventListener('click', () => {
      this.close();
      const hero = this.heroStories[this.currentHeroId];
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

  open(heroId = 'opportunity') {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (this.heroStories[heroId]) {
      this.currentHeroId = heroId;
      // Update tab active state
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

    // Spoken Text
    const narrativeBlock = beat[this.currentPerspective] || beat['robot'];
    const text = narrativeBlock[this.currentAgeBand] || narrativeBlock['explorer'];

    // Wrap sentences in spans for teleprompter highlighting
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const html = sentences.map((s, idx) => `<span class="teleprompter-sentence" id="sentence-${idx}">${s.trim()} </span>`).join('');
    m.querySelector('#story-spoken-text').innerHTML = html;
  }

  /* ===================== WEB SPEECH VOICE ENGINE ===================== */
  speakCurrentBeat() {
    if (!this.synth) {
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('Speech synthesis not supported in this browser. You can read the script above!', '📢', 3500);
      }
      return;
    }

    this.stopVoice();

    const hero = this.heroStories[this.currentHeroId];
    const beat = hero.beats[this.currentBeatIndex];
    const narrativeBlock = beat[this.currentPerspective] || beat['robot'];
    const fullText = narrativeBlock[this.currentAgeBand] || narrativeBlock['explorer'];

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = this.speechRate || 1.0;

    // Character voice tuning
    const voices = this.synth.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    if (this.currentPerspective === 'robot') {
      utterance.pitch = 1.25;
      utterance.rate = (this.speechRate || 1.0) * 0.95;
    } else if (this.currentPerspective === 'engineer') {
      utterance.pitch = 0.9;
    } else if (this.currentPerspective === 'scientist') {
      utterance.pitch = 1.05;
    } else if (this.currentPerspective === 'mission_control') {
      utterance.pitch = 0.95;
      utterance.rate = (this.speechRate || 1.0) * 1.05;
    } else if (this.currentPerspective === 'explorer') {
      utterance.pitch = 1.0;
    }

    if (enVoices.length > 0) {
      // Prefer Google or Natural voices
      const preferred = enVoices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Samantha')) || enVoices[0];
      utterance.voice = preferred;
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
      // Auto-advance hint toast
      if (this.currentBeatIndex < hero.beats.length - 1) {
        if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast(`Beat ${this.currentBeatIndex + 1} completed! Click 'Next Beat' to advance the mission.`, '🚀', 3000);
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

    if (isPlaying) {
      btn.innerHTML = '<span class="master-play-icon">⏸</span> <span class="master-play-text">Pause Story</span>';
      btn.classList.add('playing');
      if (wave) wave.classList.add('active');
    } else {
      btn.innerHTML = '<span class="master-play-icon">▶</span> <span class="master-play-text">Narrate Story</span>';
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

  /* ===================== WEB AUDIO SYNTHESIZER ===================== */
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
      osc.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low A hum (55Hz)

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
