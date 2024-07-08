import { MediaCard, BibliographieCard, CitationCard } from './ConferenceCards';
import { Scrollbar } from '../utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import React from 'react';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 10 } },
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

export const MediaCards: React.FC = () => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px]  sm:h-[450px] '>
      <Scrollbar withGap>
        <motion.div className='flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
          <motion.div key={0} variants={itemVariants}>
            <MediaCard type='image' title={`Card 1`} author={`Content for card 1`} year={1222} />
          </motion.div>
          <motion.div key={1} variants={itemVariants}>
            <MediaCard type='sound' title={`Card 2`} author={`Content for card 2`} year={1222} />
          </motion.div>
          <motion.div key={2} variants={itemVariants}>
            <MediaCard type='image' title={`Card 3`} author={`Content for card 3`} year={1222} />
          </motion.div>
          <motion.div key={3} variants={itemVariants}>
            <MediaCard type='video' title={`Card 4`} author={`Content for card 4`} year={1222} />
          </motion.div>
          <motion.div key={4} variants={itemVariants}>
            <MediaCard type='sound' title={`Card 5`} author={`Content for card 5`} year={1222} />
          </motion.div>
          <motion.div key={5} variants={itemVariants}>
            <MediaCard type='image' title={`Card 6`} author={`Content for card 6`} year={1222} />
          </motion.div>
          <motion.div key={6} variants={itemVariants}>
            <MediaCard type='video' title={`Card 7`} author={`Content for card 7`} year={1222} />
          </motion.div>
          <motion.div key={7} variants={itemVariants}>
            <MediaCard type='sound' title={`Card 8`} author={`Content for card 8`} year={1222} />
          </motion.div>
          <motion.div key={8} variants={itemVariants}>
            <MediaCard type='video' title={`Card 9`} author={`Content for card 9`} year={1222} />
          </motion.div>
          <motion.div key={9} variants={itemVariants}>
            <MediaCard type='video' title={`Card 10`} author={`Content for card 10`} year={1222} />
          </motion.div>
        </motion.div>
      </Scrollbar>
    </div>
  );
};

export const BibliographieCards: React.FC = () => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px]  sm:h-[450px] '>
      <Scrollbar withGap>
        <motion.div className='flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
          <motion.div key={0} variants={itemVariants}>
            <BibliographieCard
              author={`Rastier F.`}
              content={`Autour de la « post-vérité », de menaçantes convergences. Dans Maryvonne Holzem (éd.), Vérités citoyennes. Les sciences contre la post-vérité. Éditions du Croquant.`}
              year={2019}
            />
          </motion.div>
          <motion.div key={1} variants={itemVariants}>
            <BibliographieCard
              author={`Morin E.`}
              content={`Le Cinéma ou l'Homme imaginaire : Essai d'anthropologie. Éditions de Minuit.`}
              year={1956}
            />
          </motion.div>
          <motion.div key={2} variants={itemVariants}>
            <BibliographieCard
              author={`Guilyardi E.`}
              content={`Qu'est-ce qu'un fait en sciences physiques naturelles?. Dans Proust, S. et Lecointre, G. (dir.), Le fait en question. Éditions de l'Aube.`}
              year={2019}
            />
          </motion.div>
          <motion.div key={3} variants={itemVariants}>
            <BibliographieCard
              author={`Bergeron P.`}
              content={`Deepfake : distinguer le vrai du faux sur les implications juridiques d'une technologie « trompeuse ». Dans Barreau du Québec, Service de la formation continue, Développements récents en droit de la propriété intellectuelle (pp. 205-257). Éditions Yvon Blais.`}
              year={2020}
            />
          </motion.div>
          <motion.div key={4} variants={itemVariants}>
            <BibliographieCard
              author={`Guilyardi E.`}
              content={`Qu'est-ce qu'un fait en sciences physiques naturelles?. Dans Proust, S. et Lecointre, G. (dir.), Le fait en question. Éditions de l'Aube.`}
              year={2019}
            />
          </motion.div>
          <motion.div key={5} variants={itemVariants}>
            <BibliographieCard
              author={`Rastier F.`}
              content={`Autour de la « post-vérité », de menaçantes convergences. Dans Maryvonne Holzem (éd.), Vérités citoyennes. Les sciences contre la post-vérité. Éditions du Croquant.`}
              year={2019}
            />
          </motion.div>
          <motion.div key={6} variants={itemVariants}>
            <BibliographieCard
              author={`Bergeron P.`}
              content={`Deepfake : distinguer le vrai du faux sur les implications juridiques d'une technologie « trompeuse ». Dans Barreau du Québec, Service de la formation continue, Développements récents en droit de la propriété intellectuelle (pp. 205-257). Éditions Yvon Blais.`}
              year={2020}
            />
          </motion.div>
          <motion.div key={7} variants={itemVariants}>
            <BibliographieCard
              author={`Morin E.`}
              content={`Le Cinéma ou l'Homme imaginaire : Essai d'anthropologie. Éditions de Minuit.`}
              year={1956}
            />
          </motion.div>
          <motion.div key={8} variants={itemVariants}>
            <BibliographieCard
              author={`Guilyardi E.`}
              content={`Qu'est-ce qu'un fait en sciences physiques naturelles?. Dans Proust, S. et Lecointre, G. (dir.), Le fait en question. Éditions de l'Aube.`}
              year={2019}
            />
          </motion.div>
          <motion.div key={9} variants={itemVariants}>
            <BibliographieCard
              author={`Bergeron P.`}
              content={`Deepfake : distinguer le vrai du faux sur les implications juridiques d'une technologie « trompeuse ». Dans Barreau du Québec, Service de la formation continue, Développements récents en droit de la propriété intellectuelle (pp. 205-257). Éditions Yvon Blais.`}
              year={2020}
            />
          </motion.div>
        </motion.div>
      </Scrollbar>
    </div>
  );
};

export const CitationCards: React.FC = () => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px]  sm:h-[450px] '>
      <Scrollbar withGap>
        <motion.div className='flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
          <motion.div key={0} variants={itemVariants}>
            <CitationCard
              timecode={'12:00 - 12:15'}
              author={`Renée bourassa`}
              content={`« L'automate reconduit le fantasme millénaire de transcender la condition mortelle et prolonge le rêve d'une altérité qui se joue à travers la figure sans cesse reconduite du double faite à l'image de l'Homme. » `}
            />
          </motion.div>
          <motion.div key={1} variants={itemVariants}>
            <CitationCard
              timecode={'14:37 - 14:49'}
              author={`Robert Faguy`}
              content={`Dans les années 60, pour moi, il y. a une grande révolution qui est arrivée. Bien sûr, c'est l'éclatement des formes artistiques, surtout au point de vue des arts visuels, la question des happenings, etc. Et donc, la scène des arts vivants, le théâtre avec Leaving theatre, notamment. On regarde les performances du Leaving theatre dans les années '60-'70 (...). Et on est fasciné de voir que, justement, cette fois-là, ce sont des acteurs qui sont présents sur scène, mais qui agissent aussi en tant qu'eux-mêmes. Et donc ils se présentent et ce n'est pas juste la question d'une réalité fictionnelle. On n'est plus dans la fiction. Ils sont en train de faire des actions et ils provoquent des spectateurs d'une certaine manières, des dialogues, etc. Mais toujours en leurs noms. Alors, juste pour comprendre que cette fois-là, la réalité n'est plus juste une réalité de fiction, mais une réalité concrète dans laquelle la personne qui est sur la scène, se joue elle-même bien souvent, peut  endosser des personnages qu'elle veut, mais encore encore facilement pour dire « voici la réalité » .`}
            />
          </motion.div>
          <motion.div key={2} variants={itemVariants}>
            <CitationCard
              timecode={'16:21 - 17:02'}
              author={`Renée bourassa`}
              content={`« L'automate reconduit le fantasme millénaire de transcender la condition mortelle et prolonge le rêve d'une altérité qui se joue à travers la figure sans cesse reconduite du double faite à l'image de l'Homme. » `}
            />
          </motion.div>
          <motion.div key={3} variants={itemVariants}>
            <CitationCard
              timecode={'23:07 - 23:48'}
              author={`Renée bourassa`}
              content={`« L'automate reconduit le fantasme millénaire de transcender la condition mortelle et prolonge le rêve d'une altérité qui se joue à travers la figure sans cesse reconduite du double faite à l'image de l'Homme. » `}
            />
          </motion.div>
        </motion.div>
      </Scrollbar>
    </div>
  );
};
