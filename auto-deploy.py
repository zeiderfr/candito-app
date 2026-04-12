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
            print("\n🚀 Préparation du déploiement React...")
            
            # 0. Mise à jour de la version pour le cache
            print("  [0/3] Marquage de la nouvelle version...")
            import json
            build_version = str(int(time.time()))
            v_data = {"version": build_version}
            with open("app/public/version.json", "w") as f:
                json.dump(v_data, f)
            
            # Injection dans l'environnement pour Vite
            os.environ["VITE_APP_VERSION"] = build_version
            
            # 1. Build de l'application React
            print("  [1/3] Compilation du code moderne...")
            build_res = subprocess.run(
                "export PATH=/usr/local/bin:$PATH && cd app && npm run build",
                shell=True, capture_output=True, text=True
            )
            if build_res.returncode != 0:
                print(f"  ❌ Erreur de build : {build_res.stderr}")
                return

            # 2. Synchronisation vers la racine (pour Cloudflare Pages)
            print("  [2/3] Synchronisation vers la racine...")
            sync_res = subprocess.run(
                "cp -R app/dist/ .",
                shell=True, capture_output=True, text=True
            )

            # 3. Push vers GitHub
            print("  [3/3] Envoi vers GitHub...")
            result = subprocess.run(
                'git add . && git commit -m "auto-deploy: React version" && git push',
                shell=True,
                cwd="/Users/theodiez/Documents/Programme CANDITO",
                capture_output=True, text=True
            )
            
            if "nothing to commit" in result.stdout or "nothing to commit" in result.stderr:
                print("  ✅ Identique à la version en ligne.")
            elif result.returncode == 0:
                print("  🎉 DÉPLOYÉ AVEC SUCCÈS sur programme-candito.pages.dev !\n")
            else:
                print(f"  ❌ Erreur Git : {result.stderr}\n")


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
