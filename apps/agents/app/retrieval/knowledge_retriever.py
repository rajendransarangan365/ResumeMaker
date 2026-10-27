"""
Knowledge Base Retriever
Searches and retrieves curated Job Family taxonomies, skill synonyms, and writing patterns.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("KnowledgeRetriever")

class KnowledgeRetriever:
    def __init__(self, knowledge_dir: Optional[str] = None):
        if not knowledge_dir:
            # Default to repo root knowledge directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.knowledge_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "..", "knowledge"))
        else:
            self.knowledge_dir = knowledge_dir

        self.job_families: Dict[str, Dict[str, Any]] = {}
        self.skills_taxonomy: Dict[str, Any] = {}
        self._load_knowledge()

    def _load_knowledge(self):
        # 1. Load Job Families
        jf_dir = os.path.join(self.knowledge_dir, "job-families")
        if os.path.exists(jf_dir):
            for file_name in os.listdir(jf_dir):
                if file_name.endswith(".json") and file_name != "index.json":
                    file_path = os.path.join(jf_dir, file_name)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            self.job_families[data.get("id", file_name.replace(".json", ""))] = data
                    except Exception as e:
                        logger.error(f"Failed to load job family {file_name}: {e}")

        # 2. Load Skills Taxonomy
        st_path = os.path.join(self.knowledge_dir, "skills", "taxonomy.json")
        if os.path.exists(st_path):
            try:
                with open(st_path, "r", encoding="utf-8") as f:
                    self.skills_taxonomy = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load skills taxonomy: {e}")

    def get_all_job_families(self) -> List[Dict[str, Any]]:
        return list(self.job_families.values())

    def get_job_family_by_id(self, family_id: str) -> Optional[Dict[str, Any]]:
        return self.job_families.get(family_id)

    def find_best_job_family(self, job_title: str, text: str = "") -> Dict[str, Any]:
        """Finds the most relevant job family based on title & text keywords"""
        combined = f"{job_title} {text}".lower()

        best_family = None
        highest_score = -1

        for family in self.job_families.values():
            score = 0
            # Match family display name
            if family.get("displayName", "").lower() in combined:
                score += 15

            # Match job titles
            for jt in family.get("jobTitles", []):
                if jt.get("title", "").lower() in combined:
                    score += 10
                for alt in jt.get("alternativeTitles", []):
                    if alt.lower() in combined:
                        score += 8

            # Match technical skills
            skills = family.get("skills", {})
            for ts in skills.get("technicalSkills", []):
                if ts.get("name", "").lower() in combined:
                    score += 2

            if score > highest_score:
                highest_score = score
                best_family = family

        # Default to software-development if no strong match
        return best_family or self.job_families.get("software-development") or {}

    def get_skill_synonyms(self, skill_name: str) -> List[str]:
        """Returns known synonyms for a given skill canonical name"""
        skill_lower = skill_name.strip().lower()
        synonyms = [skill_name]

        # Check job families
        for family in self.job_families.values():
            skills = family.get("skills", {})
            for ts in skills.get("technicalSkills", []):
                if ts.get("name", "").lower() == skill_lower:
                    synonyms.extend(ts.get("synonyms", []))

        # Check universal taxonomy
        for cat in self.skills_taxonomy.get("categories", []):
            for s in cat.get("skills", []):
                if s.get("canonical", "").lower() == skill_lower:
                    synonyms.extend(s.get("synonyms", []))

        return list(set(synonyms))
