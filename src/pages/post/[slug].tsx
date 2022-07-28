import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import { FiUser, FiCalendar, FiClock } from "react-icons/fi";
import Header from '../../components/Header'
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';

import styles from './post.module.scss';
import { useRouter } from 'next/router';

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

export default function Post(props: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const readTime = props.post.data.content.reduce((acc, content) => {
    const textBody = RichText.asText(content.body)
      .split(/<.+?>(.+?)<\/.+?>/g)
      .filter(t => t);

    const ar = [];
    textBody.forEach(fr => {
      fr.split(' ').forEach(pl => {
        ar.push(pl);
      });
    });

    const min = Math.ceil(ar.length / 200);
    return acc + min;
  }, 0);

  return (
    <div className={styles.container}>
      <Header />
      <img
        src={props.post.data.banner.url}
        alt="banner"
        width={1440}
        height={400}
      />
      <main className={styles.content}>
        <strong className={styles.title}>{props.post.data.title}</strong>
        <div className={styles.details}>
          <FiCalendar />
          <time>
            {format(
              new Date(props.post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            )}
          </time>
          <FiUser />
          <small>{props.post.data.author}</small>
          <FiClock />
          <small>{readTime} min</small>
        </div>
        {props.post.data.content.map((content, index) =>
        (
          <div key={index}>
            <strong className={styles.heading}>{content.heading}</strong>
            <div
              className={styles.postContent}
              dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
            />
          </div>
        ))}
      </main>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});

  const response = await prismic.getByType('posts');
  const uids = response.results.map(post =>
    ({ params: { slug: post.uid } })
  )

  return {
    paths: uids,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('posts', String(slug), {})

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    }
  }
};
