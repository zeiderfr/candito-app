// js/nav.js — Navigation : Smart Bottom Bar
// Gère la barre d'onglets iOS style et le routage intelligent du programme.

import { getNextSession } from './state.js';

let _onTabChange = null;

// Les IDs des semaines de programme (si on veut basculer sur l'icône Programme)
const PROGRAM_WEEKS = ['s1s2', 's3', 's4', 's5', 's6'];

export function buildNav(onTabChange) {
    _onTabChange = onTabChange;

    const navItems = document.querySelectorAll('.nav-item');
    
    // Écouteur standard pour Accueil, Échauffement, Nutrition
    navItems.forEach(btn => {
        if (btn.id === 'btn-nav-programme') return; // Géré séparément
        const target = btn.dataset.target;
        if (target) {
            btn.addEventListener('click', () => switchTab(target));
        }
    });

    // Bouton Intelligent "Programme"
    const btnProgramme = document.getElementById('btn-nav-programme');
    if (btnProgramme) {
        btnProgramme.addEventListener('click', () => {
            const next = getNextSession();
            // QA : Si getNextSession retourne null, c'est que le programme est terminé. On l'oriente vers la semaine 6 (la conclusion).
            const weekId = next ? next.weekId : 's6'; 
            switchTab(weekId);
        });
    }
}

export function switchTab(tabId) {
    // 1. Appeler le render
    if (_onTabChange) _onTabChange(tabId);

    // 2. Mettre à jour l'état visuel de la NavBar
    const isProgramWeek = PROGRAM_WEEKS.includes(tabId);
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        
        // Si c'est un onglet du programme et qu'on boucle sur le bouton programme
        if (isProgramWeek && btn.id === 'btn-nav-programme') {
            btn.classList.add('active');
        } 
        // Si c'est un onglet standard
        else if (btn.dataset.target === tabId) {
            btn.classList.add('active');
        }
    });
}

// Pour compatibilité si des anciens calls utilisent switchGroup
export function switchGroup(groupId) {
    switchTab(groupId);
}
