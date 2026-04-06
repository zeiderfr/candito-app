#!/usr/bin/env python3
"""
Auto-deploy : détecte les modifications et push sur GitHub automatiquement.
Lance avec : python3 auto-deploy.py
Arrête avec : Ctrl+C
"""

import subprocess
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

IGNORED = {".git", "__pycache__", ".DS_Store", "auto-deploy.py"}
DELAY = 5  # secondes d'inactivité avant de pusher


class DeployHandler(FileSystemEventHandler):
    def __init__(self):
        self.pending = False
        self.last_event = 0

    def on_modified(self, event):
        self._trigger(event)

    def on_created(self, event):
        self._trigger(event)

    def on_deleted(self, event):
        self._trigger(event)

    def _trigger(self, event):
        path = event.src_path
        if any(ign in path for ign in IGNORED):
            return
        print(f"  Modification détectée : {path}")
        self.pending = True
        self.last_event = time.time()

    def deploy_if_ready(self):
        if self.pending and (time.time() - self.last_event) >= DELAY:
            self.pending = False
            print("\n Déploiement en cours...")
            result = subprocess.run(
                ["git", "add", ".", "&&", "git", "commit", "-m", "auto-update", "&&", "git", "push"],
                shell=False,
                cwd="/Users/theodiez/Documents/Programme CANDITO",
                capture_output=True, text=True
            )
            # Utilise shell=True pour le chaînage
            result = subprocess.run(
                'git add . && git commit -m "auto-update" && git push',
                shell=True,
                cwd="/Users/theodiez/Documents/Programme CANDITO",
                capture_output=True, text=True
            )
            if "nothing to commit" in result.stdout or "nothing to commit" in result.stderr:
                print(" Aucun changement à envoyer.")
            elif result.returncode == 0:
                print(" Déployé sur Netlify avec succès !\n")
            else:
                print(f" Erreur : {result.stderr}\n")


if __name__ == "__main__":
    path = "/Users/theodiez/Documents/Programme CANDITO"
    handler = DeployHandler()
    observer = Observer()
    observer.schedule(handler, path, recursive=True)
    observer.start()
    print("Surveillance active... (Ctrl+C pour arrêter)")
    print(f"Tout changement sera déployé automatiquement après {DELAY}s d'inactivité.\n")
    try:
        while True:
            handler.deploy_if_ready()
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nSurveillance arrêtée.")
    observer.join()
