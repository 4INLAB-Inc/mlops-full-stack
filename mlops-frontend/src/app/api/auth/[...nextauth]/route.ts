import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        // 실제 프로덕션에서는 데이터베이스 조회로 변경해야 합니다
        if (credentials.email === '4inlab@4inlab.kr' && credentials.password === '123456') {
          return {
            id: '1',
            email: credentials.email,
            name: '4INLAB Admin'
          }
        }

        throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.')
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
})

export { handler as GET, handler as POST }
