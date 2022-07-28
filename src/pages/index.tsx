import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiUser, FiCalendar } from "react-icons/fi";
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(props.postsPagination.results);

  async function getMorePosts() {
    await fetch(props.postsPagination.next_page)
      .then(data => data.json())
      .then(response => {
        const postsNextPage = response.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });
        setPosts([...postsNextPage, ...posts]);
      });
  }

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <header className={styles.logo}>
          <img src="/images/logo.svg" alt="logo" />
        </header>
        <div className={styles.content}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <FiUser />
                  <small>{post.data.author}</small>
                </div>
              </a>
            </Link>
          ))}
          {
            props.postsPagination.next_page &&
            <a className={styles.loadMorePosts} onClick={getMorePosts}>
              Carregar mais posts
            </a>
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const response = await prismic.getByType('posts', {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 20
  })

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: response.next_page
      }
    }
  }
};
