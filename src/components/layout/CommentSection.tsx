import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Link, Popover, PopoverContent, PopoverTrigger, Spinner } from '@heroui/react';
import { useAuth } from '@/hooks/useAuth';
import { createEdisemComment } from '@/services/api';
import { getComments } from '@/services/Items';
import { formatDate } from '@/lib/utils';

interface Comment {
  id: number;
  titre: string;
  contenu: string;
  author: string;
  avatar: string;
  timestamp: string;
  owner_id: number;
  actant?: number;
  actantName: string;
  commentTime?: string;
  commentText?: string;
  relatedResource?: string;
}

const CommentSection = ({ LinkedResourceId }: { LinkedResourceId: number }) => {
  const { isAuthenticated } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    getComments().then((comments: Comment[]) => {
      // Filtrer les commentaires selon le LinkedResourceId
      const filteredComments = comments.filter((comment: Comment) => comment.relatedResource === LinkedResourceId.toString());
      setComments(filteredComments);
    });
  }, [LinkedResourceId]);

  const [newContenu, setNewContenu] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!newContenu.trim()) {
      alert('Veuillez saisir votre commentaire');
      return;
    }

    setIsLoading(true);

    if (!isAuthenticated) {
      alert('Vous devez être connecté pour commenter');
      setIsLoading(false);
      return;
    }

    try {
      // Créer le commentaire via l'API réelle (utilise temporairement owner_id = 1)
      const result = await createEdisemComment({
        contenu: newContenu.trim(),
        relatedResourceId: LinkedResourceId, // Lier le commentaire à la ressource spécifique
        owner_id: 1, // Utilise temporairement l'administrateur comme owner
        class_id: 302, // Classe Edisem Commentaire
      });

      if (result.success) {

        // Forcer le rechargement des commentaires depuis l'API
        try {
          const updatedComments = await getComments(true); // Force refresh

          // Filtrer les commentaires selon le LinkedResourceId
          const filteredComments = updatedComments.filter((comment: Comment) => comment.relatedResource === LinkedResourceId.toString());
          setComments(filteredComments);

          // Trouver le commentaire qui vient d'être ajouté (le plus récent) dans les commentaires filtrés
          const newComment = filteredComments.find((comment: Comment) => comment.contenu === newContenu.trim());

          if (newComment) {
            setLastAddedId(newComment.id);
          }

          // Vider le champ
          setNewContenu('');

          // Arrêter le loading après succès
          setIsLoading(false);
        } catch (refreshError) {
          console.error('Erreur lors du rechargement des commentaires:', refreshError);
          // En cas d'erreur, garder les commentaires actuels mais vider le champ
          setNewContenu('');
          setIsLoading(false);
        }
      } else {
        // Arrêter le loading en cas d'échec de création du commentaire
        setIsLoading(false);
        throw new Error(result.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
      alert('Erreur lors de la création du commentaire. Veuillez réessayer.');
      // Le loading est déjà arrêté dans le finally du try interne ou dans le else ci-dessus

      // Réinitialiser l'animation après 500ms
      setTimeout(() => setLastAddedId(null), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && newContenu.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='w-full flex flex-col gap-6'>
      <h2 className='text-24 font-medium text-c6'>Commentaires</h2>

      {/* Zone de saisie */}
      <div className='w-full p-5 md:p-6 bg-c2 text-c6 rounded-12 flex flex-col gap-4'>
        {isAuthenticated ? (
          <textarea
            value={newContenu}
            onChange={(e) => setNewContenu(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Écrivez votre commentaire...'
            rows={3}
            maxLength={500}
            className='w-full bg-transparent text-c6 placeholder:text-[#adadad] text-sm outline-none resize-none'
          />
        ) : (
          <Popover isOpen={popoverOpen} onOpenChange={(open) => setPopoverOpen(open)}>
            <PopoverTrigger>
              <textarea
                value={newContenu}
                onChange={(e) => setNewContenu(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={() => setPopoverOpen(true)}
                placeholder='Écrivez votre commentaire...'
                rows={3}
                maxLength={500}
                className='w-full bg-transparent text-c6 placeholder:text-[#adadad] text-sm outline-none resize-none '
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className='p-4 flex flex-col gap-2 items-center max-w-[350px]'>
              <h3 className='text-16 font-bold text-c6 text-center mb-1 w-full'>Envie de participer à la conversation ?</h3>
              <div className='text-14 text-c4 text-center mb-2'>Connectez-vous pour continuer</div>
              <Link href='/login'>
                <Button size='sm' className='w-full bg-action' onClick={() => setPopoverOpen(false)}>
                  Se connecter
                </Button>
              </Link>
            </PopoverContent>
          </Popover>
        )}
        <div className='flex justify-between items-center'>
          <div className='text-xs text-[#adadad]'>{!isAuthenticated ? 'Connectez-vous pour commenter' : `${500 - newContenu.length} caractères restants`}</div>
          <button
            onClick={handleSubmit}
            disabled={!isAuthenticated || !newContenu.trim() || isLoading}
            className='px-4 py-2 bg-action hover:opacity-100 disabled:bg-action/50 disabled:cursor-not-allowed transition-colors rounded-6 text-selected text-14 flex flex-row justify-center items-center gap-2'>
            {(!isLoading && 'Envoyer') || 'Envoi...'}
            {isLoading && <Spinner color='white' size='sm' classNames={{ circle1: 'w-[15px] h-[15px] ', circle2: 'w-[15px] h-[15px] ', wrapper: 'w-[15px] h-[15px]' }} />}
          </button>
        </div>
      </div>
      {/* Liste des commentaires */}
      <div className='w-full flex flex-col gap-4'>
        {comments.length === 0 ? (
          <p className='text-[#adadad] text-sm text-center py-8'>Soyez le premier à laisser un commentaire !</p>
        ) : (
          comments.map((comment: any) => (
            <motion.div
              key={comment.id}
              className='w-full p-5 md:p-6 rounded-12 border-2 border-[#262233] flex gap-3'
              initial={comment.id === lastAddedId ? { opacity: 0, scale: 0.8, y: -20 } : false}
              animate={comment.id === lastAddedId ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}>
              <img className='w-[45px] h-[45px] rounded-6 flex-shrink-0' src={comment.actant.picture} alt={comment.author || 'Avatar'} />
              <div className='flex-1 flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-c4 text-14 font-regular'>{comment.actant.title || 'Anonyme'}</span>
                  <span className='text-[#adadad] text-12'>{comment.commentTime ? formatDate(comment.commentTime) : "À l'instant"}</span>
                </div>
                <div className='flex flex-col gap-1'>
                  <p className='text-c6 font-regular text-14 opacity-90'>{comment.commentText}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
