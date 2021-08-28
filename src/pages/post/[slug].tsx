import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import Primisc from '@prismicio/client';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO
  const [readingTime, setReadingTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const words = post?.data?.content.reduce((acc, item) => {
      const wordsPerSection = RichText.asText(item.body).split(' ').length;
      return acc + wordsPerSection;
    }, 0);
    setReadingTime(Math.ceil(words / 200));
  }, [post?.data?.content]);

  if (router.isFallback) return <h1>Carregando...</h1>;
  return (
    <>
      <div className={styles.logo}>
        <img src="/logo.svg" alt="logo" />
      </div>
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>
              <FiUser /> {post.data.author}
            </p>
            <p>
              <FiClock /> {readingTime} min
            </p>
          </div>
          {post.data.content.map(content => (
            <div key={content.heading} className={styles.content}>
              <h2> {content.heading}</h2>
              {content.body.map(body => (
                <div key={content.heading}>{body.text}</div>
              ))}
            </div>
          ))}
          <h1>Carregando...</h1>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Primisc.predicates.at('document.type', 'post'),
  ]);

  const slugsPath = posts.results.map(post => {
    const obj = {
      params: {
        slug: post.uid,
      },
    };
    return obj;
  });

  return {
    paths: slugsPath,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  // TODO
  return {
    props: {
      post,
    },
  };
};
