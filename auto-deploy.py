#!/usr/bin/env python3
"""
Auto-deploy : détecte les modifications et push sur GitHub automatiquement.
Lance avec : python3 auto-deploy.py
Arrête avec : Ctrl+C
"""

import subprocess
import time
import os
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
            print("  [2/5] Synchronisation vers la racine...")
            sync_res = subprocess.run(
                "cp -R app/dist/ .",
                shell=True, capture_output=True, text=True
            )

            # 3. Push vers GitHub (Déclenche le build Pages)
            print("  [3/5] Envoi vers GitHub...")
            result = subprocess.run(
                'git add . && git commit -m "auto-deploy: infrastructure & app" && git push',
                shell=True,
                cwd="/Users/theodiez/Documents/Programme CANDITO",
                capture_output=True, text=True
            )

            # 4. Automatisation Cloudflare (Infrastructure-as-Code)
            print("  [4/5] Synchronisation Infrastructure Cloudflare...")
            
            # Tentative de création du Namespace KV (silencieux si existe déjà)
            kv_cmd = "export PATH=/usr/local/bin:$PATH && npx wrangler kv:namespace create CANDITO_SUBS"
            kv_res = subprocess.run(kv_cmd, shell=True, capture_output=True, text=True)
            
            # Extraction de l'ID du Namespace pour wrangler.toml
            import re
            kv_id = None
            if "id =" in kv_res.stdout:
                kv_id = re.search(r'id = "(.+)"', kv_res.stdout).group(1)
            elif "CANDITO_SUBS" in kv_res.stderr: # Déjà existant
                # On essaie de lister pour retrouver l'ID
                list_cmd = "export PATH=/usr/local/bin:$PATH && npx wrangler kv:namespace list"
                list_res = subprocess.run(list_cmd, shell=True, capture_output=True, text=True)
                kv_match = re.search(r'\{ "title": "CANDITO_SUBS", "id": "(.+?)" \}', list_res.stdout)
                if kv_match: kv_id = kv_match.group(1)

            if kv_id:
                print(f"  ✨ Base de données KV prête : {kv_id}")
                # Mise à jour du wrangler.toml avec l'ID réel
                with open("wrangler.toml", "r") as f:
                    content = f.read()
                content = re.sub(r'id = ".+" # Sera remplacé', f'id = "{kv_id}" # Sera remplacé', content)
                with open("wrangler.toml", "w") as f:
                    f.write(content)

            # 5. Déploiement du Worker Automatisé
            print("  [5/5] Déploiement du Scheduled Worker...")
            worker_cmd = (
                "export PATH=/usr/local/bin:$PATH && "
                "npx wrangler deploy workers/training-reminder.ts --name candito-scheduler --cron '0 8 * * *'"
            )
            worker_res = subprocess.run(worker_cmd, shell=True, capture_output=True, text=True)
            
            if worker_res.returncode == 0:
                print("  ✅ Automatisme (CRON 8h) déployé.")
                # Configuration des secrets
                print("  [Bonus] Configuration des secrets de sécurité...")
                private_key = "ZfvH0EdMK3GTQgFBJL5ISeR3J_BD5-eXz0pgn98SuQQ"
                secret_cmd = f"echo '{private_key}' | export PATH=/usr/local/bin:$PATH && npx wrangler secret put VAPID_PRIVATE_KEY"
                subprocess.run(secret_cmd, shell=True, capture_output=True)
            else:
                print("  ⚠️ Worker : Login requis (npx wrangler login)")

            # Conclusion
            if result.returncode == 0:
                print("  🎉 DÉPLOYÉ AVEC SUCCÈS sur programme-candito.pages.dev !")
                print("  💡 Note : Si erreur 500, lancez 'npx wrangler login' une seule fois.\n")
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
