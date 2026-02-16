// Diagnostic page for testing mailto: link behavior
// Path: /test-mailto

export default function TestMailtoPage() {
  return (
    <main className="min-h-screen bg-stone-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Email Link Diagnostic Test
        </h1>

        <div className="space-y-8">
          {/* Test 1: Standalone link */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Test 1: Standalone Email Link (No Container)
            </h2>
            <p className="text-gray-600 mb-4">
              This is a simple mailto: link with no parent containers or event handlers.
              If this doesn't work, it's an environment/configuration issue.
            </p>
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <a 
                href="mailto:test@example.com"
                className="text-blue-600 hover:text-blue-800 underline text-lg"
              >
                mailto:test@example.com
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ✓ Click should open mail client<br/>
              ✓ Right-click → Copy link address should show: mailto:test@example.com
            </p>
          </section>

          {/* Test 2: Link with stopPropagation */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Test 2: Email Link With stopPropagation (ProductCard Style)
            </h2>
            <p className="text-gray-600 mb-4">
              This mimics how email links work in ProductCard component.
            </p>
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <a 
                href="mailto:sales@urbanbees.co.uk"
                className="text-blue-600 hover:text-blue-800 underline text-lg"
                onClick={(e) => e.stopPropagation()}
              >
                sales@urbanbees.co.uk
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ✓ Has onClick with stopPropagation()<br/>
              ✓ Should work same as Test 1
            </p>
          </section>

          {/* Test 3: Link inside clickable container */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Test 3: Email Link Inside Clickable Container (Potential Interference)
            </h2>
            <p className="text-gray-600 mb-4">
              This simulates a product card where the entire container is clickable.
            </p>
            <div 
              className="p-4 bg-gray-50 rounded border border-gray-200 hover:shadow-lg cursor-pointer transition-shadow"
              onClick={() => {
                console.log('Container clicked!');
                alert('Container was clicked (would navigate to product page)');
              }}
            >
              <p className="text-gray-700 mb-2">
                Click anywhere in this box → Alert should show
              </p>
              <p className="text-gray-700">
                Contact us at{' '}
                <a 
                  href="mailto:sales@urbanbees.co.uk"
                  className="text-blue-600 hover:text-blue-800 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  sales@urbanbees.co.uk
                </a>
                {' '}for details.
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ✓ Clicking email should open mail client (NOT show alert)<br/>
              ✓ Clicking elsewhere should show alert<br/>
              ✗ If clicking email shows alert → Container is intercepting
            </p>
          </section>

          {/* Test 4: Link without stopPropagation in clickable container */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Test 4: Email Link WITHOUT stopPropagation (ProductDisplay Style)
            </h2>
            <p className="text-gray-600 mb-4">
              This mimics ProductDisplay component (no stopPropagation).
            </p>
            <div 
              className="p-4 bg-gray-50 rounded border border-gray-200 hover:shadow-lg cursor-pointer transition-shadow"
              onClick={() => {
                console.log('Container clicked!');
                alert('Container was clicked');
              }}
            >
              <p className="text-gray-700">
                Contact us at{' '}
                <a 
                  href="mailto:sales@urbanbees.co.uk"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  sales@urbanbees.co.uk
                </a>
                {' '}for details.
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ⚠️ No stopPropagation - may trigger both mail client AND alert<br/>
              ✗ If only alert shows → Container is blocking mailto
            </p>
          </section>

          {/* Test 5: Subject line with parameters */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Test 5: mailto With Subject/Body (Complex URL)
            </h2>
            <p className="text-gray-600 mb-4">
              Tests if URL encoding or long parameters cause issues.
            </p>
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <a 
                href="mailto:sales@urbanbees.co.uk?subject=Product%20Inquiry&body=I%20am%20interested%20in..."
                className="text-blue-600 hover:text-blue-800 underline text-lg"
              >
                Email with subject line
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ✓ Should open mail with pre-filled subject and body<br/>
              ✗ If fails but Test 1 works → URL encoding issue
            </p>
          </section>

          {/* Instructions */}
          <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              📋 Testing Protocol
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>Test on Desktop PC first</strong> (where issue occurs)</li>
              <li><strong>Test in Chrome</strong> - document results</li>
              <li><strong>Test in Firefox/Edge</strong> - document results</li>
              <li><strong>Test on Mobile</strong> (should work) - confirm</li>
              <li><strong>Open DevTools Console</strong> (F12) - watch for errors</li>
              <li><strong>For each test above</strong>:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Click the email link</li>
                  <li>Note what happens (opens mail / nothing / navigates / alert)</li>
                  <li>Right-click → Copy link address → Verify URL is correct</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Results Template */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📝 Results Template (Copy & Fill Out)
            </h2>
            <div className="p-4 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`DESKTOP - Chrome:
[ ] Test 1: Works / Nothing happens / Error
[ ] Test 2: Works / Nothing happens / Error
[ ] Test 3: Works / Shows alert / Both
[ ] Test 4: Works / Shows alert / Both
[ ] Test 5: Works / Nothing happens / Error

DESKTOP - Firefox/Edge:
[ ] Test 1: Works / Nothing happens / Error
[ ] Test 2: Works / Nothing happens / Error
[ ] Test 3: Works / Shows alert / Both
[ ] Test 4: Works / Shows alert / Both
[ ] Test 5: Works / Nothing happens / Error

MOBILE:
[ ] Test 1: Works / Fails
[ ] Test 3: Works / Fails

ENVIRONMENT:
[ ] Standalone test (type mailto:test@example.com in address bar): Works / Fails
[ ] Default mail client configured: Yes / No
[ ] Which client: ___________

DIAGNOSIS:
If Test 1 fails + Standalone test fails = Environment issue
If Test 1 works + Test 3 fails = Container interference
If Test 1 works + Test 4 fails = Missing stopPropagation
If all work on this page but fail on real site = Different issue`}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
