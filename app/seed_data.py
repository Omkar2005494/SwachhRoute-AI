"""
Realistic Seed Dataset for SwachhRoute AI
Models Pune Municipal Corporation Ward 12 (Kothrud / Karve Road) with 50+ authentic
reports reflecting diverse waste categories, colloquial Hinglish text, and natural spatial clusters.
Problem Statement CS11 - NeuraMorphix HackForge 2026
"""

from typing import List
from app.models import Report
from app.nlp_service import extract_hazard_info

def generate_seed_reports() -> List[Report]:
    """Generates 54 realistic municipal waste complaints across Ward 12."""
    raw_data = [
        # ==========================================
        # CLUSTER 1: Kothrud Sabzi Mandi (Organic Wet Waste)
        # Centroid approx: 18.5062, 73.8055
        # ==========================================
        {
            "text": "Sabzi market ke peeche rotten cabbage aur tomato dump ho raha hai, bahut durgandh hai.",
            "lat": 18.5061, "lng": 73.8053, "citizen": "Sunil Shinde"
        },
        {
            "text": "Huge heap of rotting vegetable peelings and fruit waste left by vendors after 10 PM.",
            "lat": 18.5063, "lng": 73.8057, "citizen": "Ananya Kulkarni"
        },
        {
            "text": "Stray cows and dogs tearing apart food waste bags near market gate #2.",
            "lat": 18.5065, "lng": 73.8052, "citizen": "Vikas Joshi"
        },
        {
            "text": "Vegetable mandi corner is completely overflowing with wet organic waste, blocking footpath.",
            "lat": 18.5059, "lng": 73.8056, "citizen": "Pooja Deshmukh"
        },
        {
            "text": "Sada hua sabzi kachra roadside pe phenka hai, flies breeding rapidly.",
            "lat": 18.5064, "lng": 73.8054, "citizen": "Ramesh Pawar"
        },
        {
            "text": "Wholesale fruit crates broken and rotting papayas dumped behind market public toilet.",
            "lat": 18.5060, "lng": 73.8058, "citizen": "Kishore More"
        },
        {
            "text": "Market waste collection truck has missed this corner for 3 days, decaying smell unbearable.",
            "lat": 18.5066, "lng": 73.8055, "citizen": "Meera Apte"
        },
        {
            "text": "Rotten potatoes and coriander waste piled up in front of residential apartments.",
            "lat": 18.5058, "lng": 73.8052, "citizen": "Nitin Gadgil"
        },
        {
            "text": "Wet market mud and decomposing greens leaking into stormwater gutter.",
            "lat": 18.5062, "lng": 73.8059, "citizen": "Snehal Patwardhan"
        },
        {
            "text": "Heavy organic waste pile accumulating near market transformer, fire risk with dry leaves.",
            "lat": 18.5067, "lng": 73.8053, "citizen": "Ajay Chitale"
        },

        # ==========================================
        # CLUSTER 2: Paud Road Stormwater Nullah (Drain Blockage / Critical Silt)
        # Centroid approx: 18.5118, 73.8012
        # ==========================================
        {
            "text": "Paud road culvert drain completely blocked with plastic sacks and domestic garbage, rain flood risk.",
            "lat": 18.5117, "lng": 73.8010, "citizen": "Rohit Kadam"
        },
        {
            "text": "Dead dog carcass stuck in the nullah bridge railing, severe foul odor spreading to nearby schools.",
            "lat": 18.5119, "lng": 73.8014, "citizen": "Dr. Sanjay Ranade"
        },
        {
            "text": "Nullah overflow near bridge, dirty black water and plastic bottles choking drainage flow.",
            "lat": 18.5121, "lng": 73.8009, "citizen": "Kavita Gokhale"
        },
        {
            "text": "People dumping heavy gunny bags filled with silt into open storm water canal at night.",
            "lat": 18.5115, "lng": 73.8013, "citizen": "Mahesh Bhat"
        },
        {
            "text": "Gutter choke ho gaya hai, black water stagnant and mosquitoes multiplying dangerously.",
            "lat": 18.5120, "lng": 73.8016, "citizen": "Swati Deshpande"
        },
        {
            "text": "Decomposed animal waste and plastic tarpaulins choking the water inlet grate.",
            "lat": 18.5116, "lng": 73.8008, "citizen": "Prakash Salunkhe"
        },
        {
            "text": "Stormwater drain is being used as free dumping yard by adjacent auto garage, oil cans inside.",
            "lat": 18.5122, "lng": 73.8011, "citizen": "Deepak Kelkar"
        },
        {
            "text": "Massive choke point in drain under Paud road flyover junction, immediate heavy compactor required.",
            "lat": 18.5118, "lng": 73.8015, "citizen": "Suresh Bapat"
        },

        # ==========================================
        # CLUSTER 3: Karve Road Clinic Lane (Biomedical Hazardous Waste)
        # Centroid approx: 18.4985, 73.8182
        # ==========================================
        {
            "text": "Open dumping of yellow medical bags behind diagnostic clinic, used syringes and needles visible.",
            "lat": 18.4984, "lng": 73.8180, "citizen": "Dr. Pradeep Vaidya"
        },
        {
            "text": "Pathology lab waste, blood sample vials, and contaminated cotton thrown into open roadside bin.",
            "lat": 18.4986, "lng": 73.8184, "citizen": "Ashok Kulkarni"
        },
        {
            "text": "Hospital packaging, IV drip tubes and sharp surgical waste dumped near children's coaching class.",
            "lat": 18.4988, "lng": 73.8179, "citizen": "Shruti Natu"
        },
        {
            "text": "Used medicine blister packs and chemical disinfectant bottles leaking into footpath gravel.",
            "lat": 18.4983, "lng": 73.8185, "citizen": "Ganesh Mahajan"
        },
        {
            "text": "Ragpickers sorting through hazardous medical waste with bare hands, dangerous bio-hazard.",
            "lat": 18.4987, "lng": 73.8181, "citizen": "Rajeshwari Dixit"
        },
        {
            "text": "Clinic bio-waste dumped in unsegregated black plastic sacks on public sidewalk.",
            "lat": 18.4982, "lng": 73.8183, "citizen": "Tanmay Kanitkar"
        },
        {
            "text": "Needles and saline tubes scattered near dental clinic backdoor, safety threat to morning joggers.",
            "lat": 18.4989, "lng": 73.8186, "citizen": "Alka Phadke"
        },

        # ==========================================
        # CLUSTER 4: Dahanukar Colony Renovation Plot (Construction Debris / Malba)
        # Centroid approx: 18.4960, 73.8045
        # ==========================================
        {
            "text": "Construction contractor dumped huge truckload of cement malba, broken tiles, and red bricks on corner.",
            "lat": 18.4959, "lng": 73.8043, "citizen": "Hemant Oak"
        },
        {
            "text": "Demolition debris and concrete blocks encroaching half the road width, two-wheelers slipping.",
            "lat": 18.4962, "lng": 73.8047, "citizen": "Smita Damle"
        },
        {
            "text": "Plaster sacks and stone dust blowing into homes with wind, heavy tipper needed to clear.",
            "lat": 18.4958, "lng": 73.8042, "citizen": "Sachin Kunte"
        },
        {
            "text": "Illegal C&D waste dumping on empty plot #42, debris mixed with broken glass and iron rebar.",
            "lat": 18.4963, "lng": 73.8048, "citizen": "Anil Soman"
        },
        {
            "text": "Cement bags and crushed masonry dumped late night, blocking access to school bus stop.",
            "lat": 18.4961, "lng": 73.8044, "citizen": "Pallavi Barve"
        },
        {
            "text": "Building repair contractor refuses to remove rubble mound, pedestrian walkway destroyed.",
            "lat": 18.4957, "lng": 73.8046, "citizen": "Chetan Pendse"
        },
        {
            "text": "Malba dumping spot has expanded to 30 feet, creating blind corner for traffic.",
            "lat": 18.4964, "lng": 73.8041, "citizen": "Manish Godbole"
        },

        # ==========================================
        # CLUSTER 5: Mayur Colony Food Street (Plastic & Mixed Organic)
        # Centroid approx: 18.5095, 73.8160
        # ==========================================
        {
            "text": "Late night food stalls dump hundreds of single-use plastic tea cups and thermocol plates into bushes.",
            "lat": 18.5094, "lng": 73.8158, "citizen": "Radhika Paranjape"
        },
        {
            "text": "Oily food containers, momos chutney pouches, and beverage cans overflowing around community bin.",
            "lat": 18.5097, "lng": 73.8163, "citizen": "Rahul Agashe"
        },
        {
            "text": "Street food vendor washing greasy utensils on street and dumping food scrap directly on pavement.",
            "lat": 18.5092, "lng": 73.8157, "citizen": "Archana Sathe"
        },
        {
            "text": "Huge heap of plastic water bottles, snack wrappers, and rotten paper cardboard boxes.",
            "lat": 18.5098, "lng": 73.8162, "citizen": "Dhananjay Date"
        },
        {
            "text": "Chai tapri plastic cups clogging rainwater roadside gully, strong smell of stale oil.",
            "lat": 18.5093, "lng": 73.8165, "citizen": "Vidya Limaye"
        },
        {
            "text": "Commercial food court garbage overflowing into surrounding residential colony lane.",
            "lat": 18.5096, "lng": 73.8159, "citizen": "Siddharth Karve"
        },
        {
            "text": "Plastic packaging waste blown by wind across Mayur colony park playground.",
            "lat": 18.5091, "lng": 73.8164, "citizen": "Madhuri Tulpule"
        },
        {
            "text": "Food cart vendors dumping night leftovers into open electricity junction box area.",
            "lat": 18.5099, "lng": 73.8161, "citizen": "Omkar Bhagwat"
        },

        # ==========================================
        # ISOLATED SCATTERED REPORTS (Noise Points / Non-Clustered)
        # ==========================================
        {
            "text": "Single cardboard box and dry leaves discarded near bus stand #4.",
            "lat": 18.5140, "lng": 73.8080, "citizen": "Amit Tambe"
        },
        {
            "text": "Old sofa chair and broken wooden stool left on footpath near Cummins College gate.",
            "lat": 18.4905, "lng": 73.8150, "citizen": "Priyanka Gupte"
        },
        {
            "text": "Discarded plastic milk pouches and bread wrappers on corner near Shivaji statue.",
            "lat": 18.5020, "lng": 73.8240, "citizen": "Naveen Shah"
        },
        {
            "text": "Few empty cement sacks left near residential society boundary wall.",
            "lat": 18.5180, "lng": 73.7990, "citizen": "Vijay Karkhanis"
        },
        {
            "text": "Tree branches trimmed by electricity board left on road divider for 2 days.",
            "lat": 18.5005, "lng": 73.7980, "citizen": "Sanjay Tilak"
        }
    ]

    reports: List[Report] = []
    for idx, item in enumerate(raw_data):
        rep_id = f"REP_{idx + 101}"
        ai_res = extract_hazard_info(item["text"])

        report = Report(
            id=rep_id,
            text=item["text"],
            lat=item["lat"],
            lng=item["lng"],
            image_url=f"/static/assets/sample_{idx % 6 + 1}.jpg",
            citizen_name=item["citizen"],
            ward="Ward 12 (Kothrud)",
            timestamp=f"Today, 0{8 + (idx % 9)}:{10 + (idx * 3) % 50} AM",
            hazard_class=ai_res["hazard_class"],
            severity_score=ai_res["severity_score"],
            machinery_needed=ai_res["machinery_needed"],
            urgency=ai_res["urgency"],
            is_resolved=False,
            cluster_id=None
        )
        reports.append(report)

    return reports
