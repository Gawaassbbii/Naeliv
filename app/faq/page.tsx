"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const faqs = [
  {
    category: 'Général',
    questions: [
      {
        q: 'Qu\'est-ce que Naeliv ?',
        a: 'Naeliv est un service d\'email nouvelle génération qui privilégie votre concentration, votre vie privée et votre bien-être. Nous proposons des fonctionnalités uniques comme le Zen Mode (2 livraisons/jour), le Premium Shield (anti-spam), et l\'immersion linguistique.'
      },
      {
        q: 'Naeliv est-il vraiment gratuit ?',
        a: 'Oui ! Naeliv Essential est 100% gratuit, sans publicité, pour toujours. Nous proposons également Naeliv PRO (5€/mois) pour ceux qui veulent plus de personnalisation et de fonctionnalités avancées.'
      },
      {
        q: 'Puis-je utiliser mon adresse email actuelle ?',
        a: 'Non, Naeliv fonctionne uniquement avec des adresses @naeliv.com. Vous pouvez cependant rediriger vos emails actuels vers Naeliv ou utiliser les deux en parallèle pendant la transition.'
      }
    ]
  },
  {
    category: 'Zen Mode',
    questions: [
      {
        q: 'Puis-je choisir d\'autres horaires que 09h et 17h ?',
        a: 'Avec Naeliv Essential, les horaires sont fixés à 09h00 et 17h00. Avec Naeliv PRO, vous pouvez personnaliser complètement vos horaires de livraison.'
      },
      {
        q: 'Et si j\'ai une urgence ?',
        a: 'Pour les vraies urgences, les gens peuvent vous appeler ou vous envoyer un SMS. Le Zen Mode ne bloque que l\'email, pas les autres canaux de communication. C\'est justement le but : réserver l\'email aux choses non-urgentes.'
      },
      {
        q: 'Les emails urgents marqués "Important" arrivent-ils plus tôt ?',
        a: 'Non. Tous les emails suivent le même rythme de livraison. L\'idée est justement de casser la culture de l\'urgence permanente par email.'
      }
    ]
  },
  {
    category: 'Premium Shield',
    questions: [
      {
        q: 'Comment fonctionne le timbre payant ?',
        a: 'Quand quelqu\'un hors de vos contacts vous écrit, il reçoit un message automatique lui demandant de payer 0,10€ pour prouver qu\'il est un humain légitime et non un robot spammeur.'
      },
      {
        q: 'Que se passe-t-il si quelqu\'un refuse de payer ?',
        a: 'Son email n\'est pas livré. S\'il s\'agit d\'un vrai contact légitime, il trouvera un autre moyen de vous joindre (LinkedIn, téléphone, etc.) ou vous demandera de l\'ajouter à votre liste de contacts approuvés.'
      },
      {
        q: 'Est-ce que je reçois l\'argent des timbres ?',
        a: 'Non, les frais de timbre permettent de financer l\'infrastructure anti-spam de Naeliv. C\'est ce qui nous permet de vous garantir 0% de spam sans dépendre de la publicité.'
      }
    ]
  },
  {
    category: 'Immersion Linguistique',
    questions: [
      {
        q: 'Quelles langues sont disponibles ?',
        a: 'Actuellement : Anglais (EN) et Allemand (DE). L\'anglais est disponible en version basique dans Naeliv Essential. Les deux langues avec vocabulaire avancé sont disponibles dans Naeliv PRO.'
      },
      {
        q: 'Puis-je désactiver l\'immersion si je ne veux pas apprendre ?',
        a: 'Absolument. C\'est une fonctionnalité optionnelle que vous pouvez activer/désactiver à tout moment depuis vos paramètres.'
      },
      {
        q: 'Combien de temps pour atteindre un niveau B1 ?',
        a: 'En moyenne 6 mois pour l\'anglais et 8 mois pour l\'allemand, avec une utilisation quotidienne régulière de Naeliv. Cela dépend de votre exposition et de votre langue maternelle.'
      }
    ]
  },
  {
    category: 'Détox Digitale',
    questions: [
      {
        q: 'Mes emails sont vraiment supprimés définitivement ?',
        a: 'Oui. Après 30 jours, les emails non épinglés sont définitivement supprimés de nos serveurs. Pas d\'archive cachée, pas de sauvegarde secrète.'
      },
      {
        q: 'Puis-je récupérer un email supprimé ?',
        a: 'Non. Une fois supprimé, c\'est permanent. C\'est justement le but : vous forcer à vraiment décider ce qui est important (en l\'épinglant) plutôt que de tout garder "au cas où".'
      },
      {
        q: 'Comment être sûr de ne pas perdre quelque chose d\'important ?',
        a: 'Vous recevez un rappel 7 jours avant la suppression automatique. De plus, prenez l\'habitude d\'épingler tout ce qui compte vraiment : factures, contrats, confirmations importantes.'
      }
    ]
  },
  {
    category: 'Rewind',
    questions: [
      {
        q: 'Le destinataire sait-il que j\'ai modifié l\'email ?',
        a: 'Avec Naeliv Essential (10 secondes), non car c\'est trop rapide. Avec Naeliv PRO, une petite mention "Modifié" apparaît discrètement si vous modifiez après 1 minute.'
      },
      {
        q: 'Combien de fois puis-je modifier un email ?',
        a: 'Naeliv Essential : une seule suppression dans les 10 secondes. Naeliv PRO : modifications illimitées pendant 24h.'
      },
      {
        q: 'Que se passe-t-il si le destinataire a déjà lu l\'email ?',
        a: 'S\'il revient sur l\'email, il verra la version modifiée. Nous ne pouvons pas effacer sa mémoire, mais techniquement le contenu est mis à jour.'
      }
    ]
  },
  {
    category: 'Sécurité & Vie privée',
    questions: [
      {
        q: 'Naeliv lit-il mes emails ?',
        a: 'Non. Tous vos emails sont chiffrés de bout en bout. Même nos ingénieurs ne peuvent pas les lire. Nous ne faisons aucune analyse de contenu pour de la publicité.'
      },
      {
        q: 'Vendez-vous mes données ?',
        a: 'Jamais. Notre modèle économique repose sur les abonnements PRO et les frais de Premium Shield, pas sur la vente de données.'
      },
      {
        q: 'Où sont stockés mes emails ?',
        a: 'Sur des serveurs sécurisés en Europe (AWS Europe), conformes au RGPD. Vos données ne quittent jamais l\'Union Européenne.'
      }
    ]
  },
  {
    category: 'Tarification',
    questions: [
      {
        q: 'Quelle est la différence entre Essential et PRO ?',
        a: 'Essential est gratuit avec les fonctionnalités de base. PRO (5€/mois) offre la personnalisation complète : horaires Zen Mode sur mesure, immersion linguistique illimitée (EN+DE), Rewind 24h, alias premium, signature sans pub.'
      },
      {
        q: 'Puis-je annuler à tout moment ?',
        a: 'Oui, sans engagement. Vous pouvez annuler votre abonnement PRO depuis les paramètres à tout moment. Vous restez PRO jusqu\'à la fin de votre période payée.'
      },
    ]
  },
  {
    category: 'Technique',
    questions: [
      {
        q: 'Naeliv fonctionne-t-il sur mobile ?',
        a: 'Oui ! Naeliv est disponible via navigateur web (responsive) et nous préparons des apps iOS et Android natives pour 2025.'
      },
      {
        q: 'Puis-je utiliser Naeliv avec mon client email (Outlook, Apple Mail) ?',
        a: 'Pas directement. Naeliv fonctionne uniquement via son interface web pour garantir toutes les fonctionnalités (Zen Mode, Rewind, etc.). Nous travaillons sur des intégrations futures.'
      },
      {
        q: 'Quelle est la taille maximale des pièces jointes ?',
        a: 'Naeliv Essential : 25 MB par email. Naeliv PRO : 100 MB par email. Pour les fichiers plus volumineux, nous recommandons d\'utiliser un service de transfert externe.'
      }
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">FAQ</h1>
          <p className="text-[24px] text-gray-700 max-w-3xl mx-auto">
            Questions fréquentes sur Naeliv
          </p>
        </motion.div>

        {/* Categories */}
        <div className="space-y-12">
          {faqs.map((category, catIndex) => (
            <motion.div
              key={catIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h2 className="text-[40px] leading-none tracking-tight mb-6">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((item, qIndex) => {
                  const key = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === key;

                  return (
                    <motion.div
                      key={qIndex}
                      className="border-2 border-gray-300 rounded-2xl overflow-hidden bg-white hover:border-gray-400 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="w-full p-6 flex items-center justify-between text-left"
                      >
                        <h3 className="text-[20px] tracking-tight pr-4">{item.q}</h3>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown size={24} className="text-gray-600" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-6 text-[16px] text-gray-700 leading-relaxed border-t border-gray-200 pt-4">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl border-2 border-black text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-[18px] text-gray-700 mb-6">
            Notre équipe support est là pour vous aider.
          </p>
          <motion.button
            className="px-8 py-4 bg-black text-white rounded-full text-[16px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/contact')}
          >
            Contactez-nous
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

