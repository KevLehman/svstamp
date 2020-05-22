import React, { Component } from 'react';
import fetch from 'isomorphic-unfetch';
import Swal from 'sweetalert2';

import SEO from '../components/SEO';
import Tweet from '../components/Tweet';

import { request } from '../services/api';
import { validateTweetstampURL } from '../utils';

const swalOptions = {
  showCancelButton: false,
};

class Home extends Component {
  state = {
    url: '',
    tweets: this.props.tweets,
    isLoading: false,
  };

  handleChange = (event) => {
    const {
      target: { value },
    } = event;
    this.setState({ url: value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { url } = this.state;

    // Change loading status
    this.setState({ isLoading: true });

    // Validate url
    if (!validateTweetstampURL(url)) {
      Swal.fire({
        ...swalOptions,
        title: 'Enlace no válido',
        text: 'Por favor ingresar un enlace de tweetstamp.org',
        icon: 'error',
      });

      // Reset utl
      this.setState({ url: '', isLoading: false });

      return;
    }

    // Display loading message
    Swal.fire({
      ...swalOptions,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      title: 'Guardando...',
    });

    // Dispatch submit request
    await request(
      '/api/tweets',
      {
        method: 'POST',
        body: JSON.stringify({ url }),
      },
      ({ message = '', description = '', type = 'info', refresh = false }) => {
        // Change loading status
        this.setState({
          isLoading: false,
          url: '',
        });

        // Display response message
        Swal.fire({
          ...swalOptions,
          icon: type,
          title: message,
          text: description,
        });

        // Trigger refresh
        if (refresh) {
          this.handleRefresh();
        }
      },
    );
  };

  handleRefresh = async () => {
    // Change loading status
    this.setState({ isLoading: true });

    // Dispatch refresh request
    await request(`/api/tweets`, {}, (tweets) => {
      this.setState({ tweets, isLoading: false });
    });
  };

  render() {
    const { url = '', tweets, isLoading } = this.state;
    return (
      <>
        <SEO />
        <form
          onSubmit={this.handleSubmit}
          autoComplete="off"
          className="max-w-2xl mx-auto mt-6"
        >
          <div className="flex items-center border-b border-b-2 border-gray-300 py-2">
            <input
              name="stampLink"
              className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="url"
              value={url}
              onChange={this.handleChange}
              placeholder="Pegar enlace de @tweet_stamp"
              title="Enlace de tweetstamp.org"
              aria-label="Enlace de tweetstamp.org"
              disabled={isLoading}
              required
            />
            <button
              className="flex-shrink-0 bg-blue-700 hover:bg-blue-800 border-blue-700 hover:border-blue-800 text-sm border-4 text-white py-1 px-2 rounded"
              type="submit"
              disabled={isLoading}
            >
              Guardar
            </button>
          </div>
        </form>
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-6">
          {tweets.map((tweet) => (
            <Tweet data={tweet} key={tweet._id} />
          ))}
        </main>
      </>
    );
  }
}

export async function getStaticProps() {
  const res = await fetch(`${process.env.API_BASE}/api/tweets`);
  const tweets = await res.json();
  return {
    props: {
      tweets,
    },
  };
}

export default Home;
