"""
seed_data.py — Populates the `mock_tests` collection with real NEET / JEE
mock test content so the frontend has real data to render instead of the
old hardcoded arrays.

Run this once from the backend/ directory (with your virtualenv active and
your .env configured), from a machine that has network access to your
MongoDB Atlas cluster:

    python seed_data.py

It is safe to re-run: tests are upserted by title, so existing tests are
updated in place rather than duplicated.
"""
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


def q(qid, question, options, correct_index):
    return {"id": qid, "question": question, "options": options, "correct_answer": correct_index}


MOCK_TESTS = [
    {
        "title": "NEET Mock Test – Physics",
        "exam_type": "NEET",
        "subject": "Physics",
        "difficulty": "Hard",
        "duration_minutes": 90,
        "questions": [
            q("q1", "A body is moving with uniform velocity. The net force acting on it is:",
              ["Zero", "Equal to mass × velocity", "Greater than zero", "Cannot be determined"], 0),
            q("q2", "The SI unit of electric current is:",
              ["Volt", "Ohm", "Ampere", "Watt"], 2),
            q("q3", "Which of the following is a scalar quantity?",
              ["Force", "Velocity", "Speed", "Displacement"], 2),
            q("q4", "The work done by a force is maximum when the angle between force and displacement is:",
              ["90°", "180°", "0°", "45°"], 2),
            q("q5", "A wave with frequency 500 Hz has a wavelength of 0.6 m. Its speed is:",
              ["300 m/s", "833 m/s", "200 m/s", "500 m/s"], 0),
        ],
    },
    {
        "title": "NEET Mock Test – Chemistry",
        "exam_type": "NEET",
        "subject": "Chemistry",
        "difficulty": "Medium",
        "duration_minutes": 60,
        "questions": [
            q("q1", "The IUPAC name of CH3-CH2-OH is:",
              ["Methanol", "Ethanol", "Propanol", "Butanol"], 1),
            q("q2", "Which gas is produced when sodium reacts with water?",
              ["Oxygen", "Nitrogen", "Hydrogen", "Carbon dioxide"], 2),
            q("q3", "The atomic number of Carbon is:",
              ["4", "6", "8", "12"], 1),
            q("q4", "Which of the following is an isotope of hydrogen?",
              ["Helium", "Deuterium", "Oxygen", "Lithium"], 1),
            q("q5", "pH of a neutral solution at 25°C is:",
              ["0", "7", "14", "1"], 1),
        ],
    },
    {
        "title": "NEET Mock Test – Biology",
        "exam_type": "NEET",
        "subject": "Biology",
        "difficulty": "Medium",
        "duration_minutes": 90,
        "questions": [
            q("q1", "The powerhouse of the cell is:",
              ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], 2),
            q("q2", "DNA replication occurs in which phase of the cell cycle?",
              ["G1", "S phase", "G2", "M phase"], 1),
            q("q3", "Which of the following is NOT a function of the liver?",
              ["Detoxification", "Bile secretion", "Insulin production", "Glycogen storage"], 2),
            q("q4", "Photosynthesis occurs in:",
              ["Mitochondria", "Ribosome", "Chloroplast", "Nucleus"], 2),
            q("q5", "Which blood group is the universal donor?",
              ["A", "B", "AB", "O"], 3),
        ],
    },
    {
        "title": "NEET Full Mock – Paper 1",
        "exam_type": "NEET",
        "subject": "General",
        "difficulty": "Hard",
        "duration_minutes": 180,
        "questions": [
            q("q1", "Newton's first law of motion is also known as:",
              ["Law of gravitation", "Law of inertia", "Law of acceleration", "Law of action-reaction"], 1),
            q("q2", "The chemical formula of water is:",
              ["H2O2", "H2O", "HO", "H3O"], 1),
            q("q3", "Which organelle is responsible for protein synthesis?",
              ["Lysosome", "Centrosome", "Ribosome", "Vacuole"], 2),
            q("q4", "The speed of light in vacuum is approximately:",
              ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], 1),
            q("q5", "Mendel's Law of Segregation states:",
              ["Genes are linked", "Alleles separate during gamete formation", "All traits are dominant", "Genes mutate randomly"], 1),
        ],
    },
    {
        "title": "JEE Mock Test – Maths",
        "exam_type": "JEE",
        "subject": "Maths",
        "difficulty": "Hard",
        "duration_minutes": 60,
        "questions": [
            q("q1", "The derivative of sin(x) is:",
              ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"], 0),
            q("q2", "∫x dx equals:",
              ["x²", "x²/2 + C", "2x + C", "x + C"], 1),
            q("q3", "The value of log(1) is:",
              ["1", "0", "-1", "Undefined"], 1),
            q("q4", "If A = {1,2,3} and B = {2,3,4}, then A∩B is:",
              ["{1,2,3,4}", "{2,3}", "{1}", "{4}"], 1),
            q("q5", "The sum of interior angles of a hexagon is:",
              ["540°", "720°", "360°", "900°"], 1),
        ],
    },
    {
        "title": "JEE Mock Test – Physics",
        "exam_type": "JEE",
        "subject": "Physics",
        "difficulty": "Medium",
        "duration_minutes": 60,
        "questions": [
            q("q1", "In a perfectly elastic collision, which quantity is conserved?",
              ["Only momentum", "Only kinetic energy", "Both momentum and kinetic energy", "Neither"], 2),
            q("q2", "The unit of pressure in the SI system is:",
              ["Newton", "Pascal", "Joule", "Watt"], 1),
            q("q3", "Ohm's law relates:",
              ["Voltage and frequency", "Current and resistance", "Voltage, current and resistance", "Resistance and power"], 2),
            q("q4", "The acceleration due to gravity on the surface of Earth is approximately:",
              ["5 m/s²", "9.8 m/s²", "12 m/s²", "15 m/s²"], 1),
            q("q5", "Which lens is used to correct myopia?",
              ["Convex", "Bifocal", "Concave", "Cylindrical"], 2),
        ],
    },
    {
        "title": "State Board Mock Test – Physics",
        "exam_type": "State Board",
        "subject": "Physics",
        "difficulty": "Medium",
        "duration_minutes": 60,
        "questions": [
            q("q1", "The SI unit of power is:",
              ["Joule", "Newton", "Watt", "Pascal"], 2),
            q("q2", "A concave mirror always forms a ___ image when the object is far away.",
              ["Virtual and erect", "Real and inverted", "Virtual and inverted", "Real and erect"], 1),
            q("q3", "Which of the following is a good conductor of electricity?",
              ["Rubber", "Copper", "Wood", "Plastic"], 1),
            q("q4", "The device used to measure electric current is:",
              ["Voltmeter", "Barometer", "Ammeter", "Thermometer"], 2),
            q("q5", "Sound cannot travel through:",
              ["Water", "Air", "Vacuum", "Steel"], 2),
        ],
    },
    {
        "title": "State Board Mock Test – Chemistry",
        "exam_type": "State Board",
        "subject": "Chemistry",
        "difficulty": "Medium",
        "duration_minutes": 60,
        "questions": [
            q("q1", "Rusting of iron is an example of:",
              ["Physical change", "Chemical change", "Nuclear change", "No change"], 1),
            q("q2", "The chemical symbol for sodium is:",
              ["So", "Na", "S", "Sd"], 1),
            q("q3", "Which gas is essential for combustion?",
              ["Nitrogen", "Hydrogen", "Oxygen", "Carbon dioxide"], 2),
            q("q4", "An acid turns blue litmus paper:",
              ["Green", "Red", "Yellow", "No change"], 1),
            q("q5", "The process of converting a liquid into vapour is called:",
              ["Condensation", "Evaporation", "Sublimation", "Freezing"], 1),
        ],
    },
    {
        "title": "State Board Mock Test – Biology",
        "exam_type": "State Board",
        "subject": "Biology",
        "difficulty": "Easy",
        "duration_minutes": 60,
        "questions": [
            q("q1", "The basic unit of life is the:",
              ["Tissue", "Organ", "Cell", "Organelle"], 2),
            q("q2", "Which organ pumps blood throughout the human body?",
              ["Lungs", "Heart", "Liver", "Kidney"], 1),
            q("q3", "Plants prepare their food through the process of:",
              ["Respiration", "Photosynthesis", "Transpiration", "Digestion"], 1),
            q("q4", "The gas released by plants during photosynthesis is:",
              ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], 2),
            q("q5", "Which of the following is a communicable disease?",
              ["Diabetes", "Tuberculosis", "Anaemia", "Arthritis"], 1),
        ],
    },
    {
        "title": "State Board Mock Test – Maths",
        "exam_type": "State Board",
        "subject": "Maths",
        "difficulty": "Medium",
        "duration_minutes": 60,
        "questions": [
            q("q1", "The value of π (pi) rounded to two decimals is:",
              ["3.41", "3.14", "3.12", "3.16"], 1),
            q("q2", "The formula for the area of a circle is:",
              ["πr", "2πr", "πr²", "πd"], 2),
            q("q3", "If x + 5 = 12, then x is:",
              ["5", "6", "7", "8"], 2),
            q("q4", "The sum of the angles of a triangle is:",
              ["90°", "180°", "270°", "360°"], 1),
            q("q5", "The square root of 144 is:",
              ["10", "11", "12", "14"], 2),
        ],
    },
]


async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    await client.admin.command("ping")
    print(f"Connected to MongoDB (db={settings.MONGODB_DB_NAME})")

    for test in MOCK_TESTS:
        result = await db.mock_tests.update_one(
            {"title": test["title"]}, {"$set": test}, upsert=True
        )
        action = "inserted" if result.upserted_id else "updated"
        print(f"  {action}: {test['title']}")

    count = await db.mock_tests.count_documents({})
    print(f"Done. mock_tests collection now has {count} document(s).")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
