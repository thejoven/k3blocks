import { Navigate, Route, Routes, useParams } from "react-router";
import Layout from "@/components/Layout";
import Placeholder from "@/pages/Placeholder";
import Home from "@/pages/Home";

import Introduction from "@/pages/docs/Introduction";
import GettingStarted from "@/pages/docs/GettingStarted";
import DocumentStructure from "@/pages/docs/DocumentStructure";
import ManipulatingBlocks from "@/pages/docs/ManipulatingBlocks";
import Theming from "@/pages/docs/Theming";
import ApiReference from "@/pages/docs/ApiReference";

import BlocksIndex from "@/pages/blocks/BlocksIndex";
import BuiltInBlocks from "@/pages/docs/features/BuiltInBlocks";
import Typography from "@/pages/docs/features/Typography";
import ListTypes from "@/pages/docs/features/ListTypes";
import Tables from "@/pages/docs/features/Tables";
import Embeds from "@/pages/docs/features/Embeds";
import CodeBlocks from "@/pages/docs/features/CodeBlocks";
import MathEquations from "@/pages/docs/features/MathEquations";
import Diagrams from "@/pages/docs/features/Diagrams";
import InlineContent from "@/pages/docs/features/InlineContent";
import CustomBlocks from "@/pages/docs/features/CustomBlocks";
import Paragraph from "@/pages/blocks/pages/Paragraph";
import Heading from "@/pages/blocks/pages/Heading";
import BulletList from "@/pages/blocks/pages/BulletList";
import NumberedList from "@/pages/blocks/pages/NumberedList";
import TodoList from "@/pages/blocks/pages/TodoList";
import Quote from "@/pages/blocks/pages/Quote";
import CodeBlockPage from "@/pages/blocks/pages/CodeBlock";
import Divider from "@/pages/blocks/pages/Divider";
import ImageBlock from "@/pages/blocks/pages/Image";

import ExportMarkdown from "@/pages/docs/export/ExportMarkdown";
import ExportHtml from "@/pages/docs/export/ExportHtml";
import ExportPdf from "@/pages/docs/export/ExportPdf";
import ExportDocx from "@/pages/docs/export/ExportDocx";
import ExportEmail from "@/pages/docs/export/ExportEmail";
import ExportOdt from "@/pages/docs/export/ExportOdt";
import ImportHtml from "@/pages/docs/import/ImportHtml";
import ImportMarkdown from "@/pages/docs/import/ImportMarkdown";
import ServerSideProcessing from "@/pages/docs/advanced/ServerSideProcessing";
import Localization from "@/pages/docs/advanced/Localization";
import Extensions from "@/pages/docs/advanced/Extensions";
import CustomSchemasDoc from "@/pages/docs/customization/CustomSchemas";
import CustomInlineContentDoc from "@/pages/docs/customization/CustomInlineContent";
import CustomStylesDoc from "@/pages/docs/customization/CustomStyles";
import SourceWithPreviewDoc from "@/pages/docs/customization/SourceWithPreviewBlocks";
import ReactOverview from "@/pages/docs/react/ReactOverview";
import UiFormattingToolbar from "@/pages/docs/react/UiFormattingToolbar";
import UiGridSuggestionMenus from "@/pages/docs/react/UiGridSuggestionMenus";
import UiLinkToolbar from "@/pages/docs/react/UiLinkToolbar";
import UiFilePanel from "@/pages/docs/react/UiFilePanel";
import UiBlockSideMenu from "@/pages/docs/react/UiBlockSideMenu";
import UiSuggestionMenus from "@/pages/docs/react/UiSuggestionMenus";
import StylingThemes from "@/pages/docs/styling/StylingThemes";
import StylingOverridingCss from "@/pages/docs/styling/StylingOverridingCss";
import StylingDomAttributes from "@/pages/docs/styling/StylingDomAttributes";
import RefOverview from "@/pages/docs/reference/RefOverview";
import RefManipulatingContent from "@/pages/docs/reference/RefManipulatingContent";
import RefCursorSelections from "@/pages/docs/reference/RefCursorSelections";
import RefYjs from "@/pages/docs/reference/RefYjs";
import RefEvents from "@/pages/docs/reference/RefEvents";
import Examples from "@/pages/Examples";
import ExampleDetail from "@/pages/ExampleDetail";
import Playground from "@/pages/Playground";

/** 旧 /docs/blocks/:slug 重定向到 /blocks/:slug（保留 slug） */
function BlockSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/blocks/${slug ?? ""}`} replace />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Docs */}
        <Route path="/docs" element={<Introduction />} />
        <Route path="/docs/getting-started" element={<GettingStarted />} />
        <Route path="/docs/foundations/document-structure" element={<DocumentStructure />} />
        <Route path="/docs/foundations/manipulating-blocks" element={<ManipulatingBlocks />} />
        <Route path="/docs/foundations/theming" element={<Theming />} />
        <Route path="/docs/api" element={<ApiReference />} />

        {/* Features */}
        <Route path="/docs/features/built-in-blocks" element={<BuiltInBlocks />} />
        <Route path="/docs/features/typography" element={<Typography />} />
        <Route path="/docs/features/list-types" element={<ListTypes />} />
        <Route path="/docs/features/tables" element={<Tables />} />
        <Route path="/docs/features/embeds" element={<Embeds />} />
        <Route path="/docs/features/code-blocks" element={<CodeBlocks />} />
        <Route path="/docs/features/math" element={<MathEquations />} />
        <Route path="/docs/features/diagrams" element={<Diagrams />} />
        <Route path="/docs/features/inline-content" element={<InlineContent />} />
        <Route path="/docs/features/custom-blocks" element={<CustomBlocks />} />

        {/* Blocks — 独立顶级栏目 */}
        <Route path="/blocks" element={<BlocksIndex />} />
        <Route path="/blocks/paragraph" element={<Paragraph />} />
        <Route path="/blocks/heading" element={<Heading />} />
        <Route path="/blocks/bullet-list" element={<BulletList />} />
        <Route path="/blocks/numbered-list" element={<NumberedList />} />
        <Route path="/blocks/todo-list" element={<TodoList />} />
        <Route path="/blocks/quote" element={<Quote />} />
        <Route path="/blocks/code-block" element={<CodeBlockPage />} />
        <Route path="/blocks/divider" element={<Divider />} />
        <Route path="/blocks/image" element={<ImageBlock />} />

        {/* 旧路径重定向（v1.4 前为 /docs/blocks*） */}
        <Route path="/docs/blocks" element={<Navigate to="/blocks" replace />} />
        <Route path="/docs/blocks/:slug" element={<BlockSlugRedirect />} />

        {/* Docs v5 */}
        <Route path="/docs/export/markdown" element={<ExportMarkdown />} />
        <Route path="/docs/export/html" element={<ExportHtml />} />
        <Route path="/docs/export/pdf" element={<ExportPdf />} />
        <Route path="/docs/export/docx" element={<ExportDocx />} />
        <Route path="/docs/export/email" element={<ExportEmail />} />
        <Route path="/docs/export/odt" element={<ExportOdt />} />
        <Route path="/docs/import/html" element={<ImportHtml />} />
        <Route path="/docs/import/markdown" element={<ImportMarkdown />} />
        <Route path="/docs/advanced/server-side-processing" element={<ServerSideProcessing />} />
        <Route path="/docs/advanced/localization" element={<Localization />} />
        <Route path="/docs/advanced/extensions" element={<Extensions />} />
        <Route path="/docs/customization/custom-schemas" element={<CustomSchemasDoc />} />
        <Route path="/docs/customization/custom-inline-content" element={<CustomInlineContentDoc />} />
        <Route path="/docs/customization/custom-styles" element={<CustomStylesDoc />} />
        <Route path="/docs/customization/source-with-preview-blocks" element={<SourceWithPreviewDoc />} />
        <Route path="/docs/react/overview" element={<ReactOverview />} />
        <Route path="/docs/react/formatting-toolbar" element={<UiFormattingToolbar />} />
        <Route path="/docs/react/grid-suggestion-menus" element={<UiGridSuggestionMenus />} />
        <Route path="/docs/react/link-toolbar" element={<UiLinkToolbar />} />
        <Route path="/docs/react/file-panel" element={<UiFilePanel />} />
        <Route path="/docs/react/block-side-menu" element={<UiBlockSideMenu />} />
        <Route path="/docs/react/suggestion-menus" element={<UiSuggestionMenus />} />
        <Route path="/docs/styling/themes" element={<StylingThemes />} />
        <Route path="/docs/styling/overriding-css" element={<StylingOverridingCss />} />
        <Route path="/docs/styling/dom-attributes" element={<StylingDomAttributes />} />
        <Route path="/docs/reference/overview" element={<RefOverview />} />
        <Route path="/docs/reference/manipulating-content" element={<RefManipulatingContent />} />
        <Route path="/docs/reference/cursor-selections" element={<RefCursorSelections />} />
        <Route path="/docs/reference/yjs-utilities" element={<RefYjs />} />
        <Route path="/docs/reference/events" element={<RefEvents />} />

        {/* Examples + Playground */}
        <Route path="/examples" element={<Examples />} />
        <Route path="/examples/:slug" element={<ExampleDetail />} />
        <Route path="/playground" element={<Playground />} />

        <Route path="*" element={<Placeholder title="404 — Page not found" />} />
      </Routes>
    </Layout>
  );
}
